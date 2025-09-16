const express = require("express");
const dispatcher = require("../../../middleware/dispatcher");
const {
  uploadFile,
  getCdnFile,
  requestOtp,
} = require("../../../controller/v1");

const router = express.Router();

router.post("/request-otp", (req, res, next) => {
  dispatcher(req, res, next, requestOtp);
});

module.exports = router;
