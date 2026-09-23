import express from "express";
import { dispatcher } from "../../../middleware";
import OtpController from "./otp.controller";
const router = express.Router();
const otpController = new OtpController();

router.post("/send-otp", (req, res, next) =>
  dispatcher(req, res, next, otpController.sendotp.bind(otpController)),
);
router.post("/verify-otp", (req, res, next) =>
  dispatcher(req, res, next, otpController.verifyOtp.bind(otpController)),
);

export default router;
