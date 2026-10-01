import { Otp } from "../../../generated/prisma/client";
import { OtpType } from "../../../generated/prisma/enums";
import { ErrorHandler } from "../../../helper";
import { RequestUser } from "../../../types/express";
import { hashPassword } from "../../../utils/hash";
import { throwError } from "../../../utils/helper";
import { signAccessToken, signRefreshToken } from "../../../utils/jwt";
import { BAD_REQUEST, NOT_ACCEPTABLE, NOT_FOUND } from "../../../utils/status-codes";
import { AuthRepository } from "../auth";
import OtpHelper from "./otp.helper";
import OtpRepository from "./otp.repository";
import type {
  SendOtpBody,
  SendUpdatePasswordOtp,
  VerifyOtpBody,
  VerifyOtpResponse,
} from "./otp.type";

class OtpService {
  private readonly helper: OtpHelper;
  private readonly repository: OtpRepository;
  private readonly authRepository: AuthRepository;
  constructor() {
    this.helper = new OtpHelper();
    this.repository = new OtpRepository();
    this.authRepository = new AuthRepository();
  }
  async sendotp(body: SendOtpBody, user: RequestUser) {
    try {
      const { otpReason } = body;
      switch (otpReason) {
        case "LOGIN":
          await this.helper.sendUserLoginOtp(body);
          break;
        case "UPDATE_PASSWORD":
          await this.helper.sendPasswordUpdateOtp(body);
          break;
        default:
          throw new ErrorHandler(NOT_ACCEPTABLE, "Invalid otp reason");
      }

      return {
        message: "Otp sent successfully.",
      };
    } catch (error) {
      throwError(error);
    }
  }
  async sendUpdatePasswordOtp(body: SendUpdatePasswordOtp, user: RequestUser) {
    try {
      const userData = await this.authRepository.getUserById(user.userId);
      if (!userData) throw new ErrorHandler(NOT_FOUND, "You are not allowed to update password");
      const hashedPassword = await hashPassword(body.password);
      const payload: SendOtpBody = {
        otpReason: "UPDATE_PASSWORD",
        otpType: OtpType.EMAIL,
        otpIdentifier: userData.email,
        otpData: {
          password: hashedPassword,
        },
      };
      await this.sendotp(payload, user);
      return {
        message: "Otp sent successfully",
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
      switch (otpDetails.otpReason) {
        case "LOGIN":
          return await this.loginUser(body);
        case "UPDATE_PASSWORD":
          return await this.updatePassword(otpDetails);
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
        const permissions = await this.authRepository.getRolePermissions(userDetails.roleId);
        const payload = {
          userId: userDetails.id,
          roleId: userDetails.roleId,
          tenantId: userDetails.tenantId,
        };
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);
        return {
          message: "Otp verified successfully",
          userDetails: { ...userDetails, permissions },
          permissions,
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
  async updatePassword(otpDetails: Otp) {
    try {
      const otpData = otpDetails.otpData as { password: string };
      const email = otpDetails.otpIdentifier;
      await this.repository.updatePasswordByEmail(email, otpData.password);
      return {
        message: "Password updated successfully.",
      };
    } catch (error) {
      throwError(error);
    }
  }
}
export default OtpService;
