const util = require("util");
const fs = require("fs");
const formidable = require("formidable");
const copyFilePromise = util.promisify(fs.copyFile);
const NodeClam = require("clamscan");

let scanFile = async (filePath) => {
  if (process.env.VIRUS_CHECKER == "OFF") return true;
  const clamscan = await new NodeClam().init({
    remove_infected: true,
    debug_mode: false,
    scan_recursively: false,
    clamdscan: {
      socket: process.env.CLAMDSCAN_SOCKET || "/var/run/clamav/clamd.ctl",
      timeout: 120000,
      local_fallback: true,
      path: process.env.CLAMDSCAN_PATH || "/var/lib/clamav",
      config_file:
        process.env.CLAMDSCAN_CONFIG_FILE || "/etc/clamav/clamd.conf",
    },
  });

  const { is_infected, viruses } = await clamscan.scan_file(filePath);

  if (is_infected) {
    console.error(`Virus scan failed, file INFECTED`, { filePath, viruses });
  } else {
    console.log(`Virus scan OK`, { filePath });
  }

  return is_infected;
};

const copyFiles = (srcDir, destDir, dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return copyFilePromise(srcDir, destDir);
};

const formidableUpload = async (req) => {
  try {
    const form = new formidable.IncomingForm();

    const MAX_FILE_UPLOAD_BYTES = 50 * 1024 * 1024; // 50MB
    const MAX_FIELDS_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

    form.maxFileSize = MAX_FILE_UPLOAD_BYTES;
    form.maxFieldsSize = MAX_FIELDS_SIZE_BYTES;
    form.keepExtensions = true;
    form.multiples = false;

    const formfields = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(new Error("Form Not parsed"));

        const cleanedFiles = {};

        for (const key in files) {
          let file = files[key];

          if (Array.isArray(file)) {
            file = file[0];
          }

          cleanedFiles[key] = {
            filepath: file?.filepath || file?._writeStream?.path || null,
            newFilename: file?.newFilename || null,
            originalFilename: file?.originalFilename || null,
            mimetype: file?.mimetype || null,
            size: file?.size || null,
            hashAlgorithm: file?.hashAlgorithm || null,
          };
        }

        resolve({ fields, files: cleanedFiles });
      });
    });

    return formfields;
  } catch (error) {
    console.error("Error in formidable upload:", error.message);
  }
};

module.exports = {
  formidableUpload,
  scanFile,
  copyFiles,
};
