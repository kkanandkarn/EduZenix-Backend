const otpSchema = require("./Otp");
const authSchema = require("./auth");

const schemas = {
  ...otpSchema,
  ...authSchema,
};
module.exports = schemas;
