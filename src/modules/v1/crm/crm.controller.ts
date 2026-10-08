import CrmService from "./crm.service";
import { validateBulkAddUniversity } from "./crm.validation";
import type { NextFunction, Request, Response } from "express";
class CrmController {
  private readonly service: CrmService;
  constructor() {
    this.service = new CrmService();
  }
  async bulkAddUniversity(req: Request, res: Response, next: NextFunction) {
    try {
      const body = validateBulkAddUniversity(req.body);
      const result = await this.service.bulkAddUniversity(body, req.user);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
export default CrmController;
