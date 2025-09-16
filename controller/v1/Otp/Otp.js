const sequelize = require("../../../config/db");
const { Otp } = require("../../../services/v1");

const requestOtp = async (req, res, next) => {
  try {
    let data = {};
    await sequelize.transaction(async (t1) => {
      data = await new Otp().requestOtp(req.body);
    });
    return data;
  } catch (error) {
    next(error);
  }
};
module.exports = {
  requestOtp,
};
