import type { Request } from "express";
import type { Fields, Files, File } from "formidable";
import formidable from "formidable";
import fs from "node:fs/promises";
import sharp from "sharp";
import { ErrorHandler } from "../helper";
import { throwError } from "./helper";
import { BAD_REQUEST } from "./status-codes";

export type OptimizedFiles = Record<string, File | File[] | undefined>;

interface FormidableUploadResult {
  fields: Fields;
  files: OptimizedFiles;
}

export const formidableUpload = async (
  req: Request,
): Promise<FormidableUploadResult | undefined> => {
  try {
    // formidable v3's default export is the factory itself; `new
    // formidable.IncomingForm()` only exists on the namespace export.
    const form = formidable();

    form.on("error", (e: Error) => console.log(e));
    form.on("aborted", () => console.log("aborted"));

    const formFields = await new Promise<FormidableUploadResult>((resolve, reject) => {
      form.parse(req, (err: Error, fields: Fields, files: Files) => {
        if (err) {
          reject(err);
          return;
        }

        // Fire-and-handle async optimization inside the sync callback
        (async () => {
          const optimizedFiles: OptimizedFiles = {};

          for (const fieldName in files) {
            const entry = files[fieldName];
            if (!entry) {
              optimizedFiles[fieldName] = entry;
              continue;
            }

            const fileArray = Array.isArray(entry) ? entry : [entry];

            const optimized = await Promise.all(
              fileArray.map(async (file) => {
                if (file.mimetype && file.mimetype.includes("image")) {
                  const optimizedPath = `optimized_${file.originalFilename ?? file.newFilename}`;

                  await sharp(file.filepath)
                    .resize({ width: 1000 })
                    .jpeg({ quality: 70 })
                    .toFile(optimizedPath);

                  const metadata = await sharp(optimizedPath).metadata();

                  const optimizedFile: File = {
                    ...file,
                    filepath: optimizedPath,
                    size: metadata.size ?? file.size,
                  };

                  return optimizedFile;
                }

                return file;
              }),
            );

            optimizedFiles[fieldName] = Array.isArray(entry) ? optimized : optimized[0];
          }

          resolve({ fields, files: optimizedFiles });
        })().catch(reject);
      });
    });

    return formFields;
  } catch (error) {
    throwError(error);
  }
};

/**
 * Multipart fields arrive as arrays; collapse them to the first value so the
 * result can be handed to the same Joi schemas that validate a JSON body.
 */
export const flattenFields = (fields: Fields): Record<string, string> => {
  const flattened: Record<string, string> = {};

  for (const fieldName in fields) {
    const value = fields[fieldName];
    if (value?.length) {
      flattened[fieldName] = value[0];
    }
  }

  return flattened;
};

const pickFile = (files: OptimizedFiles, fieldName: string): File | undefined => {
  const entry = files[fieldName];
  return Array.isArray(entry) ? entry[0] : entry;
};

/**
 * Reads the uploaded HTML file of the given field and returns its markup.
 * The temp file formidable wrote is removed once it has been read.
 */
export const readHtmlFile = async (files: OptimizedFiles, fieldName: string): Promise<string> => {
  const file = pickFile(files, fieldName);
  if (!file) {
    throw new ErrorHandler(BAD_REQUEST, `${fieldName} file is required`);
  }

  const filename = file.originalFilename ?? file.newFilename ?? "";
  const isHtml = file.mimetype === "text/html" || /\.html?$/i.test(filename);
  if (!isHtml) {
    throw new ErrorHandler(BAD_REQUEST, `${fieldName} must be a .html file`);
  }

  try {
    const content = await fs.readFile(file.filepath, "utf-8");
    if (!content.trim()) {
      throw new ErrorHandler(BAD_REQUEST, `${fieldName} file cannot be empty`);
    }
    return content;
  } finally {
    await fs.unlink(file.filepath).catch(() => undefined);
  }
};
