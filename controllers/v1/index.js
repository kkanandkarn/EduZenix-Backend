const auth = require("./auth");
const crm = require("./crm");
const otp = require("./otp");
module.exports = {
  ...auth,
  ...crm,
  ...otp,
};
