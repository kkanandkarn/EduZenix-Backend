const express = require("express");
const dispatcher = require("../../../middleware/dispatcher");
const { requestOtp, verifyOtp } = require("../../../controller/v1");

const router = express.Router();

router.post("/request-otp", (req, res, next) => {
  dispatcher(req, res, next, requestOtp);
});
router.post("/verify-otp", (req, res, next) => {
  dispatcher(req, res, next, verifyOtp);
});

module.exports = router;
