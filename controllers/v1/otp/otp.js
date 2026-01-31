const sequelize = require("../../../config/db");
const { Otp } = require("../../../services/v1");

const requestOtp = async (req, res, next) => {
  try {
    const data = await new Otp().requestOtp(req.body);
    return data;
  } catch (error) {
    next(error);
  }
};
const verifyOtp = async (req, res, next) => {
  try {
    const data = await new Otp().verifyOtp(req.body);
    return data;
  } catch (error) {
    next(error);
  }
};
module.exports = {
  requestOtp,
  verifyOtp,
};
