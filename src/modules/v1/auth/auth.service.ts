import { ErrorHandler } from "../../../helper";
import type { RequestUser } from "../../../types/express";
import { externalApiCall } from "../../../utils/axios";
import { compare } from "../../../utils/hash";
import { throwError } from "../../../utils/helper";
import {
  rotateRefreshToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../../utils/jwt";
import { NOT_ACCEPTABLE, NOT_FOUND, UNAUTHORIZED } from "../../../utils/status-codes";
import AuthRepository from "./auth.repository";
import type {
  GoogleLogincallbackQuery,
  GoogleTokenResponse,
  GoogleUserInfo,
  LoginBody,
} from "./auth.type";

class AuthService {
  private readonly repository: AuthRepository;
  private readonly GOOGLE_CLIENT_ID: string;
  private readonly GOOGLE_CLIENT_SECRET: string;
  private readonly GOOGLE_REDIRECT_URI: string;

  constructor() {
    this.repository = new AuthRepository();
    this.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
    this.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
    this.GOOGLE_REDIRECT_URI = `${process.env.BACKEND_URL}/v1/auth/google/callback`;
  }
  async login(body: LoginBody) {
    try {
      const { email, password } = body;
      const user = await this.repository.getUserByEmail(email, true);
      if (!user) {
        throw new ErrorHandler(NOT_FOUND, "User with this email does not exists");
      }
      if (!user.password) {
        throw new ErrorHandler(
          NOT_ACCEPTABLE,
          "You have not set a password for your account. Please login with otp and set password from profile section.",
        );
      }
      const isCorrectPassword = await compare(user.password, password);
      if (!isCorrectPassword) {
        throw new ErrorHandler(UNAUTHORIZED, "Invalid Password");
      }
      const userDetails = await this.repository.getUserById(user.id);
      const permissions = await this.repository.getRolePermissions(user.roleId);
      const payload = {
        userId: user.id,
        roleId: user.roleId,
        tenantId: user.tenantId,
      };
      const accessToken = signAccessToken(payload);
      const refreshToken = signRefreshToken(payload);
      await this.repository.addRefereshToken(user.id, refreshToken);
      return {
        userDetails: { ...userDetails, permissions },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throwError(error);
    }
  }
  async profileDetails(user: RequestUser) {
    try {
      const userDetails = await this.repository.getUserById(user.userId);
      const permissions = await this.repository.getRolePermissions(user.roleId);
      return {
        userDetails: { ...userDetails, permissions },
      };
    } catch (error) {
      throwError(error);
    }
  }
  async logout(user: RequestUser) {
    try {
      await this.repository.removeRefereshToken(user.userId);
    } catch (error) {
      throwError(error);
    }
  }
  async refresh(refreshToken?: string) {
    try {
      if (!refreshToken) {
        throw new ErrorHandler(UNAUTHORIZED, "Missing refresh Token");
      }

      let payload;
      try {
        payload = verifyRefreshToken(refreshToken);
      } catch {
        throw new ErrorHandler(UNAUTHORIZED, "Invalid referesh token");
      }

      const userId = payload.userId;
      const user = await this.repository.getUserById(userId, true);

      if (!user) {
        throw new ErrorHandler(NOT_FOUND, "User not found");
      }

      if (!user.refreshToken) {
        throw new ErrorHandler(NOT_ACCEPTABLE, "Token has been revoked");
      }

      if (user.refreshToken !== refreshToken) {
        throw new ErrorHandler(UNAUTHORIZED, "Invalid refresh token");
      }

      const rotateToken = rotateRefreshToken(payload);
      if (rotateToken) {
        await this.repository.addRefereshToken(userId, rotateToken);
        refreshToken = rotateToken;
      }

      const userDetails = await this.repository.getUserById(user.id);
      const permissions = await this.repository.getRolePermissions(user.roleId);
      const tokenPayload = {
        userId: user.id,
        roleId: user.roleId,
        tenantId: user.tenantId,
      };
      const newAccessToken = signAccessToken(tokenPayload);

      return {
        userDetails: { ...userDetails, permissions },
        accessToken: newAccessToken,
        refreshToken,
      };
    } catch (error) {
      throwError(error);
    }
  }
  googleLogin() {
    try {
      const params = new URLSearchParams({
        client_id: this.GOOGLE_CLIENT_ID,
        redirect_uri: this.GOOGLE_REDIRECT_URI,
        response_type: "code",
        scope: "openid profile email",
      });
      return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    } catch (error) {
      throwError(error);
    }
  }
  async googleLoginCallback(query: GoogleLogincallbackQuery) {
    try {
      const { code } = query;
      const tokenUrl = "https://oauth2.googleapis.com/token";
      const tokenMethod = "POST";
      const tokenBody = {
        client_id: this.GOOGLE_CLIENT_ID,
        client_secret: this.GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: this.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      };
      const tokenResponse = await externalApiCall<GoogleTokenResponse>(tokenUrl, {
        method: tokenMethod,
        data: tokenBody,
      });
      const googleAccessToken = tokenResponse?.access_token;
      const infoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
      const infoMethod = "GET";
      const infoHeaders = {
        Authorization: `Bearer ${googleAccessToken}`,
      };
      const userInfo = await externalApiCall<GoogleUserInfo>(infoUrl, {
        method: infoMethod,
        headers: infoHeaders,
      });
      console.log("USER INFO: ", userInfo);

      const userDetails = await this.repository.getUserByEmail(userInfo.email);
      if (!userDetails) {
        return { success: false };
      }

      const permissions = await this.repository.getRolePermissions(userDetails.roleId);
      const payload = {
        userId: userDetails.id,
        roleId: userDetails.roleId,
        tenantId: userDetails.tenantId,
      };
      const accessToken = signAccessToken(payload);
      const refreshToken = signRefreshToken(payload);
      await this.repository.addRefereshToken(userDetails.id, refreshToken);
      return {
        success: true,
        userDetails: { ...userDetails, permissions },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throwError(error);
    }
  }
}
export default AuthService;
