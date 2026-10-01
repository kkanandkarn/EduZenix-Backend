export interface VerifyMfaSetupBody {
  code: string;
  userId: string;
}
export interface DisableMfaBody {
  password?: string;
  code?: string;
}
