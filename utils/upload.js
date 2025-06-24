const formidable = require("formidable");
const { FILE_UPLOAD_PATH, FILE_GENERATED_PATH } = process.env;
const fs = require("fs");
const { SUCCESS } = require("./constant");
const { SERVER_ERROR } = require("../helper/status-codes");
const { throwError } = require("./throw-error");
const path = require("path");
const util = require("util");
const copyFilePromise = util.promisify(fs.copyFile);
const { BASEURL } = process.env;

const formidableUpload = async (req) => {
  try {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.multiples = false;
    const formfields = await new Promise(function (resolve, reject) {
      form.parse(req, function (err, fields, files) {
        if (err) {
          reject(err);
          return;
        }
        if (files.document && Array.isArray(files.document)) {
          files.document = files.document[0];
        }

        resolve({ fields, files });
      }); // form.parse
    });
    return formfields;
  } catch (error) {
    throw error;
  }
};

const copyFiles = (srcDir, destDir, dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return copyFilePromise(srcDir, destDir);
};

const uploadToCloud = async (files, key = "document", directoryName) => {
  try {
    const fileUploadPath = path.resolve(FILE_UPLOAD_PATH);
    const uploadDir = `${fileUploadPath}/${directoryName}`;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, {
        recursive: true,
      });
    }

    const { nanoid } = await import("nanoid");
    const fileId = nanoid();

    let fileName = fileId + path.extname(files[key].originalFilename);

    copyFiles(files[key].filepath, `${uploadDir}/${fileName}`, uploadDir);

    const fileUrl = `${BASEURL}/uploads/${directoryName}/${fileName}`;

    const maskUrl = `${BASEURL}/cdn/uploads/${fileId}`;

    return {
      fileId,
      fileUrl,
      maskUrl,
    };
  } catch (error) {
    throwError(error);
  }
};

module.exports = {
  formidableUpload,
  uploadToCloud,
};
