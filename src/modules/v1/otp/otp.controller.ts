import { NextFunction, Request, Response } from "express";
import OtpService from "./otp.service";
import { validateSendOtp, validateVerifyOtp } from "./otp.validation";

class OtpController {
  private readonly service: OtpService;
  constructor() {
    this.service = new OtpService();
  }
  async sendotp(req: Request, res: Response, next: NextFunction) {
    try {
      const body = validateSendOtp(req.body);
      return await this.service.sendotp(body);
    } catch (error) {
      next(error);
    }
  }
  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const body = validateVerifyOtp(req.body);
      const data = await this.service.verifyOtp(body);
      if (data?.accessToken && data?.refreshToken) {
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
      }
      if (body.otpReason === "LOGIN") return data?.userDetails ?? {};
      return data;
    } catch (error) {
      next(error);
    }
  }
}
export default OtpController;
