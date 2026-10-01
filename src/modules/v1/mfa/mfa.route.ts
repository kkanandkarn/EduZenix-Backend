import express from "express";
import { authValidator, dispatcher } from "../../../middleware";
import MfaController from "./mfa.controller";
const router = express.Router();
const mfaController = new MfaController();

router.get("/initiate-setup", (req, res, next) =>
  dispatcher(req, res, next, mfaController.initiateSetup.bind(mfaController)),
);
router.post("/verify-setup", (req, res, next) =>
  dispatcher(req, res, next, mfaController.verifySetup.bind(mfaController)),
);
router.post("/disable-mfa", authValidator, (req, res, next) =>
  dispatcher(req, res, next, mfaController.disableMfa.bind(mfaController)),
);
export default router;
