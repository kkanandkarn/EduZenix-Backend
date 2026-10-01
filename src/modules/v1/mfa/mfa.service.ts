import { ErrorHandler } from "../../../helper";
import type { RequestUser } from "../../../types/express";
import { SUCCESS } from "../../../utils/constant";
import { decryptData, encryptData } from "../../../utils/crypto";
import { compare } from "../../../utils/hash";
import { throwError } from "../../../utils/helper";
import { NOT_ACCEPTABLE, NOT_FOUND } from "../../../utils/status-codes";
import { AuthRepository } from "../auth";
import MfaRepository from "./mfa.repository";
import type { DisableMfaBody, VerifyMfaSetupBody } from "./mfa.type";
import { authenticator } from "otplib";
import QRCode from "qrcode";

class MfaService {
  private readonly authRepository: AuthRepository;
  private readonly repositoy: MfaRepository;
  constructor() {
    this.authRepository = new AuthRepository();
    this.repositoy = new MfaRepository();
  }
  async initiateSetup(user: RequestUser) {
    try {
      const userId = user.userId;
      const userData = await this.authRepository.getUserById(userId);
      if (!userData) {
        throw new ErrorHandler(NOT_FOUND, "User not found");
      }
      const email = userData.email;

      const secret = authenticator.generateSecret();
      const ecryptSecret = encryptData(secret);
      await this.repositoy.saveMfaSecret(userId, ecryptSecret);
      const otpauth = authenticator.keyuri(email, "Eduzenix", secret);

      const qrCode = await QRCode.toDataURL(otpauth);

      return {
        secret,
        qrCode,
      };
    } catch (error) {
      throwError(error);
    }
  }
  async verifySetup(body: VerifyMfaSetupBody, user: RequestUser) {
    try {
      const userId = user.userId;
      const token = body.code;

      const userData = await this.authRepository.getUserById(userId, true);
      if (!userData) {
        throw new ErrorHandler(NOT_FOUND, "User not found");
      }
      const ecryptSecret = userData.mfaSecret;
      const secret = await decryptData(ecryptSecret as string);

      const valid = authenticator.verify({
        token,
        secret: secret as string,
      });

      if (!valid) {
        throw new ErrorHandler(NOT_ACCEPTABLE, "Invalid code");
      }
      await this.repositoy.updateMfaStatus(userId, true);
      return {
        message: SUCCESS,
      };
    } catch (error) {
      throwError(error);
    }
  }
  async disableMfa(body: DisableMfaBody, user: RequestUser) {
    try {
      const { code, password } = body;
      const userData = await this.authRepository.getUserById(user.userId, true);
      if (!userData) {
        throw new ErrorHandler(NOT_FOUND, "User not found");
      }
      if (userData.requireMfa || userData.role.requireMfa) {
        throw new ErrorHandler(NOT_ACCEPTABLE, "You cannot disable mfa.");
      }
      if (!userData.mfaSecret) {
        throw new ErrorHandler(NOT_FOUND, "Mfa not found");
      }
      if (!userData.password) {
        throw new ErrorHandler(NOT_ACCEPTABLE, "Please set a password to disable MFA.");
      }
      if (code) {
        const ecryptSecret = userData.mfaSecret;
        const secret = await decryptData(ecryptSecret);

        const valid = authenticator.verify({
          token: code,
          secret: secret as string,
        });

        if (!valid) {
          throw new ErrorHandler(NOT_ACCEPTABLE, "Invalid code");
        }
      } else {
        const isCorrectPassword = await compare(userData.password, password!);
        if (!isCorrectPassword) {
          throw new ErrorHandler(NOT_ACCEPTABLE, "Invalid Password");
        }
      }
      await this.repositoy.updateMfaStatus(user.userId, false);
      return {
        message: SUCCESS,
      };
    } catch (error) {
      throwError(error);
    }
  }
}
export default MfaService;
