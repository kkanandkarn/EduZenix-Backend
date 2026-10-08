import express from "express";
import { authValidator, dispatcher } from "../../../middleware";
import AuthController from "./auth.controller";
const router = express.Router();
const authController = new AuthController();

router.post("/login", (req, res, next) =>
  dispatcher(req, res, next, authController.login.bind(authController)),
);
router.get("/profile-details", authValidator, (req, res, next) =>
  dispatcher(req, res, next, authController.profileDetails.bind(authController)),
);
router.post("/logout", authValidator, (req, res, next) =>
  dispatcher(req, res, next, authController.logout.bind(authController)),
);
router.post("/refresh", (req, res, next) =>
  dispatcher(req, res, next, authController.refresh.bind(authController)),
);
router.post("/google/login", (req, res, next) =>
  dispatcher(req, res, next, authController.googleLogin.bind(authController)),
);
router.get("/google/callback", (req, res, next) =>
  dispatcher(req, res, next, authController.googleLoginCallback.bind(authController)),
);

export default router;
