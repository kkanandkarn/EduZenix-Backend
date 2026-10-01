import type { Prisma } from "../../../generated/prisma/client";
import type { AuthStatus, OtpType, UserType } from "../../../generated/prisma/enums";

export type OtpReason = "LOGIN" | "UPDATE_PASSWORD";
export interface SendOtpBody {
  otpReason: OtpReason;
  otpType: OtpType;
  otpIdentifier: string;
  otpData?: Record<string, string>;
}
export interface VerifyOtpBody {
  otpReason: OtpReason;
  otpType: OtpType;
  otpIdentifier: string;
  otp: string;
}
export type UserDetails = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  requireMfa: boolean;
  mfaCompleted: boolean;
  tenantId: string;
  userType: UserType;
  status: AuthStatus;
  createdBy: string | null;
  updatedBy: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  permissions?: RolePermissions;
};
export interface RolePermissions {
  roleId: string;
  permissionId: string;
  permissionName: string;
  parent: string;
}
export interface OtpLoginBody {
  email?: string;
  phone?: string;
}
export interface SaveOtpBody {
  otpReason: OtpReason;
  otp: string;
  otpType: OtpType;
  otpIdentifier: string;
  otpData?: Prisma.InputJsonObject;
}
export interface SendUpdatePasswordOtp {
  password: string;
}
export interface VerifyOtpResponse {
  message: string;
  accessToken?: string;
  refreshToken?: string;
  userDetails?: UserDetails;
}
