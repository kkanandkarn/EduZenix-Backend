const express = require("express");
const router = express.Router();
const {
  listUniveristy,
  listCollege,
  listOtherInstitution,
} = require("../../../controllers/v1");
const { globalPermissions } = require("../../../utils");
const { dispatcher } = require("../../../middleware");
const { RESOURCES, PERMS } = globalPermissions;

router.post("/list-university", (req, res, next) => {
  dispatcher(
    req,
    res,
    next,
    listUniveristy,
    RESOURCES.CRM,
    PERMS.VIEW_UNIVERSITY,
  );
});
router.post("/list-college", (req, res, next) => {
  dispatcher(req, res, next, listCollege, RESOURCES.CRM, PERMS.VIEW_COLLEGE);
});
router.post("/list-institution", (req, res, next) => {
  dispatcher(
    req,
    res,
    next,
    listOtherInstitution,
    RESOURCES.CRM,
    PERMS.VIEW_OTHER_INSTITUTION,
  );
});
module.exports = router;
