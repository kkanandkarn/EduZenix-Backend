import express from "express";
import { dispatcher } from "../../../middleware";
import CrmController from "./crm.controller";
import { PERMISSION_GROUP, PERMISSION_NAME } from "../../../utils/permissions";
const router = express.Router();
const crmController = new CrmController();

router.post("/bulk-add-university", (req, res, next) =>
  dispatcher(
    req,
    res,
    next,
    crmController.bulkAddUniversity.bind(crmController),
    PERMISSION_GROUP.UNIVERSITY,
    PERMISSION_NAME.ADD_UNIVERSITY,
  ),
);

export default router;
