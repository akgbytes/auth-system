import { prisma } from "../configs/db";
import { logger } from "../configs/logger";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import { ResponseStatus } from "../utils/constants";
import { CustomError } from "../utils/CustomError";
import { handleZodError } from "../utils/handleZodError";
import { hashPassword, passwordMatch } from "../utils/helper";
import { sanitizeUser } from "../utils/sanitizeUser";
import { validatePassword } from "../validations/auth.validation";

export const getProfile = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const user = await prisma.user.findUnique({ where: { id } });

  // do i really need this?
  if (!user) {
    throw new CustomError(ResponseStatus.NotFound, "User not found");
  }

  const safeUser = sanitizeUser(user);

  logger.info("User profile fetched", { email: user.email });

  res
    .status(ResponseStatus.Success)
    .json(
      new ApiResponse(
        ResponseStatus.Success,
        "User profile fetched successfully",
        safeUser
      )
    );
});

export const changePassword = asyncHandler(async (req, res) => {
  const { password } = handleZodError(validatePassword(req.body));
  const { id } = req.user;

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new CustomError(ResponseStatus.NotFound, " User not found");
  }

  const isPasswordSame = await passwordMatch(password, user.password as string);

  if (!isPasswordSame) {
    throw new CustomError(ResponseStatus.Unauthorized, "Password");
  }

  const hashedPassword = await hashPassword(password);

  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });

  // sare existing session ko invalidate krna h bcuz of security
  await prisma.session.deleteMany({ where: { userId: user.id } });

  logger.info(`Password change successful for ${user.email}`);

  res
    .status(ResponseStatus.Success)
    .json(
      new ApiResponse(
        ResponseStatus.Success,
        "Password changed successfully",
        null
      )
    );
});

export const updateProfile = asyncHandler(async (req, res) => {});
