import "express";

declare global {
  namespace Express {
    interface Request {
      user: RequestUser;
    }
  }
}
export interface RequestUser {
  ip: string;
  isAuth: boolean;
  userId: string;
  roleId: string;
}
