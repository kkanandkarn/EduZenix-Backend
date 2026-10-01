import type { NextFunction, Request, Response } from "express";
import MfaService from "./mfa.service";
import { validateDisableMfa, validateVerifySetup } from "./mfa.validation";

class MfaController {
  private readonly service: MfaService;
  constructor() {
    this.service = new MfaService();
  }
  async initiateSetup(req: Request, res: Response, next: NextFunction) {
    try {
      return await this.service.initiateSetup(req.user);
    } catch (error) {
      next(error);
    }
  }
  async verifySetup(req: Request, res: Response, next: NextFunction) {
    try {
      const body = validateVerifySetup(req.body);
      return await this.service.verifySetup(body, req.user);
    } catch (error) {
      next(error);
    }
  }
  async disableMfa(req: Request, res: Response, next: NextFunction) {
    try {
      const body = validateDisableMfa(req.body);
      return await this.service.disableMfa(body, req.user);
    } catch (error) {
      next(error);
    }
  }
}
export default MfaController;
