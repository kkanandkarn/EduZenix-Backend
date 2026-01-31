const authSchema = require("./auth");
const otpSchema = require("./otp");

const schemas = {
  ...authSchema,
  ...otpSchema,
};
module.exports = schemas;
