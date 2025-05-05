import { User } from "../generated/prisma";

export const sanitizeUser = (user: User) => {
  const {
    password,
    verificationToken,
    verificationTokenExpiry,
    resetPasswordToken,
    resetPasswordExpiry,
    ...safeUser
  } = user;
  return safeUser;
};
