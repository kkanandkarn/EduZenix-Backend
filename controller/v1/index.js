const { login } = require("./auth");
const { uploadFile, getCdnFile } = require("./cdn");
const {
  listUniveristy,
  listCollege,
  listInstitution,
  generateOnboardingLink,
  getOnboardingData,
  sendOnboardingEmail,
} = require("./crm");
const { requestOtp } = require("./Otp");

module.exports = {
  login,
  listUniveristy,
  listCollege,
  listInstitution,
  generateOnboardingLink,
  getOnboardingData,
  sendOnboardingEmail,
  uploadFile,
  getCdnFile,
  requestOtp,
};
