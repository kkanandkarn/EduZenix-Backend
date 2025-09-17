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
const { requestOtp, verifyOtp } = require("./Otp");

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
  verifyOtp
};
