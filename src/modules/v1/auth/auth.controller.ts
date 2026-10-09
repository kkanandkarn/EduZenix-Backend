import type { NextFunction, Request, Response } from "express";
import AuthService from "./auth.service";
import { validateLogin } from "./auth.validation";
import { REDIRECT } from "../../../utils/status-codes";

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
        path: "/v1/auth/refresh", // Scoped: only sent to refresh endpoint
      });
      return data?.userDetails ?? {};
    } catch (error) {
      next(error);
    }
  }
  async profileDetails(req: Request, res: Response, next: NextFunction) {
    try {
      return await this.service.profileDetails(req.user);
    } catch (error) {
      next(error);
    }
  }
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refresh_token;
      const data = await this.service.refresh(refreshToken);
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
        path: "/v1/auth/refresh", // Scoped: only sent to refresh endpoint
      });
      return {
        message: "Token refreshed successfully",
      };
    } catch (error) {
      next(error);
    }
  }
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await this.service.logout(req.user);

      const isSecure = process.env.NODE_ENV === "production";
      res.clearCookie("access_token", {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
      });

      res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        path: "/v1/auth/refresh", // must match the scoped path from login
      });
      return { message: "Logged out successfully" };
    } catch (error) {
      next(error);
    }
  }
  googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const googleLoginUrl = this.service.googleLogin();
      res.redirect(REDIRECT, googleLoginUrl!);
    } catch (error) {
      next(error);
    }
  }
  async googleLoginCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as { code: string };
      const data = await this.service.googleLoginCallback(query);
      const isSecure = process.env.NODE_ENV === "production";
      if (data?.success) {
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
          path: "/v1/auth/refresh", // Scoped: only sent to refresh endpoint
        });
        return data?.userDetails ?? {};
      }

      res.cookie("auth_error", "user_not_found", {
        httpOnly: false, // frontend JS must be able to read it
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 1000, // 1 minute, auto-expires if never read
        path: "/",
      });

      res.redirect(REDIRECT, process.env.FRONTEND_URL!);
    } catch (error) {
      next(error);
    }
  }
}
export default AuthController;
