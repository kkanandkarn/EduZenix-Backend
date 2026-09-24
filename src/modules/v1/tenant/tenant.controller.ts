import TenantService from "./tenant.service";
import { NextFunction, Request, Response } from "express";
import { validateCreateTenant } from "./tenant.validation";
import { prisma } from "../../../config";

class TenantController {
  private readonly service: TenantService;
  constructor() {
    this.service = new TenantService();
  }
  async createTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const body = validateCreateTenant(req.body);

      return await prisma.$transaction(async (tx) => {
        return await this.service.createTenant(body, req.user, tx);
      });
    } catch (error) {
      next(error);
    }
  }
}
export default TenantController;
