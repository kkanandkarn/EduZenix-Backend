import { AuthStatus, OtpType, UserType } from "../../../generated/prisma/enums";

export type OtpReason = "LOGIN" | "UPDATE_PASSWORD";
export interface SendOtpBody {
  otpReason: OtpReason;
  otpType: OtpType;
  otpIdentifier: string;
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
};
export interface OtpLoginBody {
  email?: string;
  phone?: string;
}
export interface SaveOtpBody {
  otpReason: OtpReason;
  otp: string;
  otpType: OtpType;
  otpIdentifier: string;
  otpData?: Record<string, any>;
}
