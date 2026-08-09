import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const REFRESH_TOKEN_RENEW_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface VerifyTokenResponse {
  userId: string;
  roleId: string;
  iat?: number;
  exp?: number;
}

export interface TokenPayload {
  userId: string;
  roleId: string;
}

export const signAccessToken = (payload: TokenPayload): string => {
  if (!ACCESS_SECRET) throw new Error("MISSING ACCESS TOKEN SECRET IN ENV");
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "10m" });
};

export const signRefreshToken = (payload: TokenPayload): string => {
  if (!REFRESH_SECRET) throw new Error("MISSING REFERESH TOKEN SECRET IN ENV");
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "3d" });
};

export const verifyAccessToken = (token: string): VerifyTokenResponse => {
  if (!ACCESS_SECRET) throw new Error(" MISSING ACCESS TOKEN SECRET IN ENV");

  return jwt.verify(token, ACCESS_SECRET) as VerifyTokenResponse;
};

export const verifyRefreshToken = (token: string): VerifyTokenResponse => {
  if (!REFRESH_SECRET) throw new Error("MISSING REFERESH TOKEN SECRET IN ENV");

  //   ignoreExpiration: true — skips the expiry (exp) check, so expired tokens still decode successfully
  return jwt.verify(token, REFRESH_SECRET, {
    ignoreExpiration: true,
  }) as VerifyTokenResponse;
};

export function rotateRefreshToken(payload: VerifyTokenResponse): string | null {
  const expiresAt = (payload.exp ?? 0) * 1000;
  const timeLeft = expiresAt - Date.now();
  if (timeLeft < REFRESH_TOKEN_RENEW_THRESHOLD_MS) {
    return signRefreshToken({
      userId: payload.userId,
      roleId: payload.roleId,
    });
  }

  return null;
}
