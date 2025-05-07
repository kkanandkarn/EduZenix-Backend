const formidable = require("formidable");

const formidableUpload = async (req) => {
  try {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.multiples = true;
    const formfields = await new Promise(function (resolve, reject) {
      form.parse(req, function (err, fields, files) {
        if (err) {
          reject(err);
          return;
        }

        resolve({ fields, files });
      }); // form.parse
    });
    return formfields;
  } catch (error) {
    throw error;
  }
};
module.exports = {
  formidableUpload,
};
