import { uploadOnCloudinary } from "../configs/cloudinary";
import { prisma } from "../configs/db";
import { logger } from "../configs/logger";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import { CustomError } from "../utils/CustomError";
import { handleZodError } from "../utils/handleZodError";
import { hashPassword, passwordMatch } from "../utils/helper";
import { sanitizeUser } from "../utils/sanitizeUser";
import { validateChangePassword } from "../validations/auth.validation";
import { validateUpdateProfile } from "../validations/user.validation";

export const getProfile = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new CustomError(404, "User not found");
  }

  const safeUser = sanitizeUser(user);

  logger.info("User profile fetched", { email: user.email, userId: user.id, ip: req.ip });

  res.status(200).json(new ApiResponse(200, "User profile fetched successfully", safeUser));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = handleZodError(validateChangePassword(req.body));
  const { id } = req.user;

  const user = await prisma.user.findUnique({ where: { id } });

  // iski jrurat to h nhi waise but phirbhi
  if (!user) {
    throw new CustomError(404, "User not found");
  }

  const isCurrentPasswordCorrect = await passwordMatch(currentPassword, user.password as string);

  if (!isCurrentPasswordCorrect) {
    throw new CustomError(401, "Current password is incorrect");
  }

  const isSameAsOld = await passwordMatch(newPassword, user.password as string);
  if (isSameAsOld) {
    throw new CustomError(400, "New password must be different from the current password");
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });

  // sare existing session ko invalidate krna h bcuz of security
  await prisma.session.deleteMany({ where: { userId: user.id } });

  logger.info("Password changed successfully", { email: user.email, userId: user.id, ip: req.ip });

  res.status(200).json(new ApiResponse(200, "Password changed successfully", null));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { id, email } = req.user;
  const { username, fullname } = handleZodError(validateUpdateProfile(req.body));

  // Checking if username available
  const existingUser = await prisma.user.findFirst({
    where: {
      username,
      NOT: { id },
    },
  });

  if (existingUser) {
    throw new CustomError(400, "Username is already taken");
  }

  let avatarUrl: string | undefined;
  if (req.file) {
    try {
      const uploaded = await uploadOnCloudinary(req.file.path);
      avatarUrl = uploaded?.secure_url;
      logger.info("Avatar uploaded successfully", { email, avatarUrl });
    } catch (err: any) {
      logger.warn(`Avatar upload failed for ${email} due to ${err.message}`);
    }
  }

  const updateData: any = {};
  if (username) updateData.username = username;
  if (fullname) updateData.fullname = fullname;
  if (avatarUrl) updateData.avatar = avatarUrl;

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  const safeUser = sanitizeUser(updatedUser);

  logger.info("User profile updated", { email: safeUser.email, userId: safeUser.id, ip: req.ip });

  res.status(200).json(new ApiResponse(200, "Profile updated successfully", safeUser));
});
