import { prisma } from "../configs/db";
import { logger } from "../configs/logger";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import { CustomError } from "../utils/CustomError";

export const deleteUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new CustomError(400, "User ID is required");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new CustomError(404, "User not found");
  }

  await prisma.user.delete({ where: { id: user.id } });

  logger.info(`Admin deleted user with ID ${userId}`);

  res.status(200).json(new ApiResponse(200, "User deleted successfully", null));
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      fullname: true,
      avatar: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  logger.info(`Admin fetched all users`);

  res.status(200).json(new ApiResponse(200, "Users fetched successfully", users));
});

export const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      fullname: true,
      avatar: true,
      role: true,
      createdAt: true,
      sessions: {
        select: {
          id: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
          expiresAt: true,
        },
      },
    },
  });

  if (!user) {
    throw new CustomError(404, "User not found");
  }

  res.status(200).json(new ApiResponse(200, "User fetched successfully", user));
});

export const updateUserById = asyncHandler(async (req, res) => {});

export const deleteUserSessionById = asyncHandler(async (req, res) => {});
