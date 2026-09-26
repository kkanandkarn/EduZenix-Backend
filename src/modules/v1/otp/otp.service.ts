import { ErrorHandler } from "../../../helper";
import { throwError } from "../../../utils/helper";
import { signAccessToken, signRefreshToken } from "../../../utils/jwt";
import { BAD_REQUEST, NOT_ACCEPTABLE, NOT_FOUND } from "../../../utils/status-codes";
import { AuthRepository } from "../auth";
import OtpHelper from "./otp.helper";
import OtpRepository from "./otp.repository";
import type { SendOtpBody, VerifyOtpBody } from "./otp.type";

class OtpService {
  private readonly helper: OtpHelper;
  private readonly repository: OtpRepository;
  private readonly authRepository: AuthRepository;
  constructor() {
    this.helper = new OtpHelper();
    this.repository = new OtpRepository();
    this.authRepository = new AuthRepository();
  }
  async sendotp(body: SendOtpBody) {
    try {
      const { otpReason } = body;
      if (otpReason === "LOGIN") {
        await this.helper.sendUserLoginOtp(body);
      } else {
        throw new ErrorHandler(NOT_ACCEPTABLE, "Invalid OTP reason");
      }

      return {
        message: "Otp sent successfully.",
      };
    } catch (error) {
      throwError(error);
    }
  }
  async verifyOtp(body: VerifyOtpBody) {
    try {
      const { otp, otpIdentifier, otpReason, otpType } = body;
      const otpDetails = await this.repository.getOtpData(otpIdentifier, otpReason, otpType);
      if (!otpDetails) throw new ErrorHandler(NOT_FOUND, "No generated otp found");

      if (otpDetails.isUsed || otpDetails.expiredAt < new Date()) {
        throw new ErrorHandler(NOT_ACCEPTABLE, "Otp Expired. Please request a new otp");
      }

      if (otpDetails.otp !== otp) {
        throw new ErrorHandler(BAD_REQUEST, "Invalid Otp");
      }
      await this.repository.markOtpUsed(otpDetails.id);
      if (otpDetails.otpReason === "LOGIN") {
        return await this.loginUser(body);
      }
      return {
        message: "Otp verified successfully",
      };
    } catch (error) {
      throwError(error);
    }
  }
  async loginUser(body: VerifyOtpBody) {
    try {
      if (body.otpType === "EMAIL") {
        const userDetails = await this.authRepository.getUserByEmail(body.otpIdentifier);
        if (!userDetails) throw new ErrorHandler(NOT_FOUND, "User with email does not exists");
        const payload = {
          userId: userDetails.id,
          roleId: userDetails.roleId,
          tenantId: userDetails.tenantId,
        };
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);
        return {
          message: "Otp verified successfully",
          userDetails,
          accessToken,
          refreshToken,
        };
      }
      return {
        message: "Otp verified successfully",
      };
    } catch (error) {
      throwError(error);
    }
  }
}
export default OtpService;
