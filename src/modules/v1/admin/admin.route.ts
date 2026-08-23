import express from "express";
import { dispatcher } from "../../../middleware";
import AdminController from "./admin.controller";
const router = express.Router();
const adminController = new AdminController();

router.post("/add-global-permissions", (req, res, next) =>
  dispatcher(req, res, next, adminController.addGlobalPermissions.bind(adminController)),
);
router.post("/update-global-permission", (req, res, next) =>
  dispatcher(req, res, next, adminController.updateGlobalPermission.bind(adminController)),
);
router.get("/list-global-permissions", (req, res, next) =>
  dispatcher(req, res, next, adminController.listGlobalPermissions.bind(adminController)),
);
router.post("/create-tenant", (req, res, next) =>
  dispatcher(req, res, next, adminController.createTenant.bind(adminController)),
);
export default router;
