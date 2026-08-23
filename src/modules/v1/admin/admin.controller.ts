import { NextFunction, Request, Response } from "express";
import AdminService from "./admin.service";
import { validateAddGlobalPermission, validateUpdateGlobalPermission } from "./admin.validtion";
import { TenantController } from "../tenant";
import { validateCreateTenant } from "../tenant/tenant.validation";
import { prisma } from "../../../config";

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
}
export default AdminController;
