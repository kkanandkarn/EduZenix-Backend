import type { NextFunction, Request, Response } from "express";
import AuthService from "./auth.service";
import { validateLogin } from "./auth.validation";

class AuthController {
  private readonly service: AuthService;
  constructor() {
    this.service = new AuthService();
  }
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const body = validateLogin(req.body);
      const data = await this.service.login(body);

      const isSecure = process.env.NODE_ENV === "production";

      // access token in a short-lived httpOnly cookie (invisible to JS)
      res.cookie("access_token", data?.accessToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        maxAge: 10 * 60, // 10 minutes
      });

      // Refresh token in a long-lived httpOnly cookie (invisible to JS)
      res.cookie("refresh_token", data?.refreshToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        maxAge: 3 * 24 * 60 * 60, // 3 days
        path: "/api/auth/refresh", // Scoped: only sent to refresh endpoint
      });
      return data?.userDetails ?? {};
    } catch (error) {
      next(error);
    }
  }
}
export default AuthController;
