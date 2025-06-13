const express = require("express");
const dispatcher = require("../../../middleware/dispatcher");
const globalPermisisons = require("../../../utils/global-permissions");
const {
  listUniveristy,
  listCollege,
  listInstitution,
  generateOnboardingLink,
  getOnboardingData,
  sendOnboardingEmail,
} = require("../../../controller/v1");
const router = express.Router();

router.post("/list-university", (req, res, next) => {
  dispatcher(req, res, next, listUniveristy, globalPermisisons.VIEW_UNIVERISTY);
});
router.post("/list-college", (req, res, next) => {
  dispatcher(req, res, next, listCollege, globalPermisisons.VIEW_COLLEGE);
});
router.post("/list-institution", (req, res, next) => {
  dispatcher(
    req,
    res,
    next,
    listInstitution,
    globalPermisisons.VIEW_INSTITUTION
  );
});
router.post("/generate-onboarding-link", (req, res, next) => {
  dispatcher(
    req,
    res,
    next,
    generateOnboardingLink,
    globalPermisisons.ONBOARD_ORGANISATION
  );
});
router.get("/get-onboarding-data/:linkId", (req, res, next) => {
  dispatcher(req, res, next, getOnboardingData);
});
router.post("/send-onboarding-mail", (req, res, next) => {
  dispatcher(req, res, next, sendOnboardingEmail);
});

module.exports = router;
