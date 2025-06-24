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
};
