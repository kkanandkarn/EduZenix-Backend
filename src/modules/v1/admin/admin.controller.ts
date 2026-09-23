import { NextFunction, Request, Response } from "express";
import AdminService from "./admin.service";
import {
  validateAddGlobalPermission,
  validateSaveConstant,
  validateSaveMailTemplate,
  validateUpdateGlobalPermission,
} from "./admin.validtion";
import { TenantController } from "../tenant";
import { ErrorHandler } from "../../../helper";
import { BAD_REQUEST } from "../../../utils/status-codes";
import { flattenFields, formidableUpload, readHtmlFile } from "../../../utils/upload";

class AdminController {
  private readonly service: AdminService;
  private readonly tenantController: TenantController;
  constructor() {
    this.service = new AdminService();
    this.tenantController = new TenantController();
  }
  async addGlobalPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const body = validateAddGlobalPermission(req.body);
      return await this.service.addGlobalPermissions(body);
    } catch (error) {
      next(error);
    }
  }
  async updateGlobalPermission(req: Request, res: Response, next: NextFunction) {
    try {
      const body = validateUpdateGlobalPermission(req.body);
      return await this.service.updateGlobalPermission(body);
    } catch (error) {
      next(error);
    }
  }
  async saveMailTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const form = await formidableUpload(req);
      if (!form) {
        throw new ErrorHandler(BAD_REQUEST, "Invalid form data.");
      }
      const body = validateSaveMailTemplate(flattenFields(form.fields));
      const html = await readHtmlFile(form.files, "html");
      return await this.service.saveMailTemplate({ ...body, body: html });
    } catch (error) {
      next(error);
    }
  }
  async listGlobalPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      return await this.service.listGlobalPermissions();
    } catch (error) {
      next(error);
    }
  }
  async createTenant(req: Request, res: Response, next: NextFunction) {
    try {
      return await this.tenantController.createTenant(req, res, next);
    } catch (error) {
      next(error);
    }
  }
  async saveConstant(req: Request, res: Response, next: NextFunction) {
    try {
      const body = validateSaveConstant(req.body);
      return await this.service.saveConstant(body);
    } catch (error) {
      next(error);
    }
  }
}
export default AdminController;
