const sequelize = require("../../../config/db");
const { auth } = require("../../../services/v1");
const { formidableUpload } = require("../../../utils/upload");

const login = async (req, res, next) => {
  try {
    let data = [];
    await sequelize.transaction(async (t1) => {
      data = await auth.login(req);
    });
    return data;
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
};
