import { prisma } from "../configs/db";
import { logger } from "../configs/logger";
import { UserRole } from "../generated/prisma";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import { CustomError } from "../utils/CustomError";
import { sanitizeUser } from "../utils/sanitizeUser";

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

export const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  const allowedRoles = Object.values(UserRole);
  if (!role || !allowedRoles.includes(role)) {
    throw new CustomError(400, "Invalid or missing role");
  }
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  const safeUser = sanitizeUser(updatedUser);

  logger.info(`Role of ${userId} is updated successfully to ${role}`, {
    updatedBy: req.user.email,
  });

  res.status(200).json(new ApiResponse(200, "User role updated successfully", safeUser));
});

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

export const deleteUserSessionById = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    throw new CustomError(400, "Session ID is required");
  }

  await prisma.session.delete({ where: { id: sessionId } });

  logger.info(`Session ${sessionId} deleted`, { deletedBy: req.user.email });

  res.status(200).json(new ApiResponse(200, "Session deleted successfully", null));
});
