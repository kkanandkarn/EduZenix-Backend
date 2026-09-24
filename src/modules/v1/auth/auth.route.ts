import express from "express";
import { dispatcher } from "../../../middleware";
import AuthController from "./auth.controller";
const router = express.Router();
const authController = new AuthController();

router.post("/login", (req, res, next) =>
  dispatcher(req, res, next, authController.login.bind(authController)),
);

export default router;
