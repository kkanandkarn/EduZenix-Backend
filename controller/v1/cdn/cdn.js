const sequelize = require("../../../config/db");
const Cdn = require("../../../services/v1/cdn/cdn");
const { formidableUpload } = require("../../../utils/upload");

const uploadFile = async (req, res, next) => {
  try {
    let data = [];
    let { files, fields } = await formidableUpload(req);

    await sequelize.transaction(async (t1) => {
      data = await new Cdn().uploadFile(fields, req.user, files);
    });
    return data;
  } catch (error) {
    next(error);
  }
};
const getCdnFile = async (req, res, next) => {
  try {
    let data = [];
    await sequelize.transaction(async (t1) => {
      data = await new Cdn().getCdnFile(req.params.fileId);
    });
    return data;
  } catch (error) {
    next(error);
  }
};
module.exports = {
  uploadFile,
  getCdnFile,
};
