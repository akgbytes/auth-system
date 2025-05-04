import { User } from "./generated/prisma";

export type SafeUser = Omit<
  User,
  | "password"
  | "verificationToken"
  | "verificationTokenExpiry"
  | "resetPasswordToken"
  | "resetPasswordExpiry"
>;

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}
export {};
