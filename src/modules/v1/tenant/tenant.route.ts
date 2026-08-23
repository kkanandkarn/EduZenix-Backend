import express from "express";
import { dispatcher } from "../../../middleware";
import TenantController from "./tenant.controller";
const router = express.Router();
const tenantController = new TenantController();

router.post("/create-tenant", (req, res, next) =>
  dispatcher(req, res, next, tenantController.createTenant.bind(tenantController)),
);

export default router;
