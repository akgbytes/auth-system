import jwt from "jsonwebtoken";
import ms, { StringValue } from "ms";
import { uploadOnCloudinary } from "../configs/cloudinary";
import { prisma } from "../configs/db";
import { env } from "../configs/env";
import { logger } from "../configs/logger";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import { cookieOptions, ResponseStatus } from "../utils/constants";
import { CustomError } from "../utils/CustomError";
import { handleZodError } from "../utils/handleZodError";
import {
  generateAccessToken,
  generateRefreshToken,
  generateToken,
  hashPassword,
  createHash,
  isPasswordCorrect,
} from "../utils/helper";
import { sendResetPasswordMail, sendVerificationMail } from "../utils/sendMail";
import {
  validateEmail,
  validateLogin,
  validatePasswordReset,
  validateRegister,
} from "../validations/auth.validation";
import { sanitizeUser } from "../utils/sanitizeUser";
import { decodedUser } from "../types";

export const register = asyncHandler(async (req, res) => {
  const { username, email, password, fullname } = handleZodError(
    validateRegister(req.body)
  );

  logger.info(`Registration attempt for email: ${email}`);

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new CustomError(
      ResponseStatus.Conflict,
      "Email is already registered"
    );
  }

  const hashedPassword = await hashPassword(password);
  const { unHashedToken, hashedToken, tokenExpiry } = generateToken();

  let avatarUrl;
  if (req.file) {
    // wrapping in try catch bcuz upload na hone se we dont want to stop registration process
    try {
      const uploaded = await uploadOnCloudinary(req.file.path);
      avatarUrl = uploaded?.secure_url;
      logger.info(`Avatar uploaded for user: ${email}`);
    } catch (err: any) {
      logger.warn(`Avatar upload failed for ${email}: ${err.message}`);
    }
  }

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      fullname,
      avatar: avatarUrl,
      verificationToken: hashedToken,
      verificationTokenExpiry: tokenExpiry,
    },
  });

  await sendVerificationMail(user.fullname, user.email, unHashedToken);
  logger.info(`Verification email sent to ${email}`);

  const safeUser = sanitizeUser(user);

  res
    .status(ResponseStatus.Success)
    .json(
      new ApiResponse(
        ResponseStatus.Success,
        "User registered successfully. Please verify your email",
        safeUser
      )
    );
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token)
    throw new CustomError(
      ResponseStatus.BadRequest,
      "Verification token is required"
    );

  const hashedToken = createHash(token);

  const user = await prisma.user.findFirst({
    where: {
      verificationToken: hashedToken,
      verificationTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new CustomError(
      ResponseStatus.Unauthorized,
      "The verification link is invalid or has expired"
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    },
  });

  logger.info(`Email verified ${user.email}`);

  res
    .status(ResponseStatus.Success)
    .json(
      new ApiResponse(
        ResponseStatus.Success,
        "Email verified successfully",
        null
      )
    );
});

export const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = handleZodError(validateEmail(req.body));

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new CustomError(
      ResponseStatus.Unauthorized,
      "No account found with this email address"
    );
  }

  if (user.isEmailVerified) {
    throw new CustomError(
      ResponseStatus.BadRequest,
      "Email is already verified"
    );
  }

  const { unHashedToken, hashedToken, tokenExpiry } = generateToken();

  await prisma.user.update({
    where: { email },
    data: {
      verificationToken: hashedToken,
      verificationTokenExpiry: tokenExpiry,
    },
  });

  await sendVerificationMail(user.fullname, user.email, unHashedToken);

  logger.info(`Verification email resent to ${email}`);

  res
    .status(ResponseStatus.Success)
    .json(
      new ApiResponse(
        ResponseStatus.Success,
        "Verification mail sent successfully. Please check your inbox",
        null
      )
    );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = handleZodError(validateLogin(req.body));

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new CustomError(ResponseStatus.Unauthorized, "Invalid credentials");
  }

  if (!user.isEmailVerified) {
    throw new CustomError(ResponseStatus.Unauthorized, "Email is not verified");
  }

  const passwordMatch = await isPasswordCorrect(
    password,
    user.password as string
  );

  if (!passwordMatch) {
    throw new CustomError(ResponseStatus.Unauthorized, "Invalid credentials");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const expiresAt = new Date(
    Date.now() + ms(env.REFRESH_TOKEN_EXPIRY as StringValue)
  );

  await prisma.session.create({
    data: {
      userId: user.id,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
      refreshToken,
      expiresAt,
    },
  });

  logger.info("User logged in", { email: user.email });

  res
    .status(ResponseStatus.Success)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: env.NODE_ENV === "production",
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: env.NODE_ENV === "production",
    })
    .json(new ApiResponse(ResponseStatus.Success, "Login successful", null));
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new CustomError(
      ResponseStatus.BadRequest,
      "Refresh token not provided"
    );
  }

  await prisma.session.delete({
    where: { refreshToken },
  });

  logger.info("User logged out");

  res
    .status(ResponseStatus.Success)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(
      new ApiResponse(ResponseStatus.Success, "Logged out successfully", null)
    );
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = handleZodError(validateEmail(req.body));

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res
      .status(ResponseStatus.Success)
      .json(
        new ApiResponse(
          ResponseStatus.Success,
          "If an account exists, a reset link has been sent to the email",
          null
        )
      );
  }

  const { unHashedToken, hashedToken, tokenExpiry } = generateToken();

  // already upr check hogya h user n middleware catch krlega error agar nhi mila
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: tokenExpiry,
    },
  });

  await sendResetPasswordMail(user.fullname, user.email, unHashedToken);

  logger.info("Password reset email sent", {
    email: user.email,
  });

  res
    .status(ResponseStatus.Success)
    .json(
      new ApiResponse(
        ResponseStatus.Success,
        "If an account exists, a reset link has been sent to the email",
        null
      )
    );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = handleZodError(validatePasswordReset(req.body));

  if (!token) {
    throw new CustomError(ResponseStatus.BadRequest, "Reset token is missing");
  }

  const hashedToken = createHash(token);

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    throw new CustomError(
      ResponseStatus.Unauthorized,
      "Token is invalid or expired"
    );
  }

  const hashedPassword = await hashPassword(password);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiry: null,
    },
  });

  // sare existing session ko invalidate krna h bcuz of security
  await prisma.session.deleteMany({ where: { userId: user.id } });

  logger.info("Password reset successful", { email: user.email });

  res
    .status(ResponseStatus.Success)
    .json(
      new ApiResponse(
        ResponseStatus.Success,
        "Password reset successfully",
        null
      )
    );
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    throw new CustomError(ResponseStatus.Unauthorized, "Unauthorized request");
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, env.REFRESH_TOKEN_SECRET);
  } catch (error: any) {
    // if (error.name === "TokenExpiredError") {
    //   logger.warn("Expired access token");
    // } else if (error.name === "JsonWebTokenError") {
    //   logger.warn("Invalid access token");
    // }
    throw new CustomError(
      ResponseStatus.Unauthorized,
      "Invalid or expired refresh token"
    );
  }

  // it is possible that token is valid but already refreshed and someone is using old token
  const validToken = await prisma.session.findUnique({
    where: { refreshToken: incomingRefreshToken },
  });

  if (!validToken) {
    throw new CustomError(
      ResponseStatus.Unauthorized,
      "Refresh token has been used"
    );
  }

  const accessToken = generateAccessToken(decoded as decodedUser);
  const refreshToken = generateRefreshToken(decoded as decodedUser);

  await prisma.session.update({
    where: { id: validToken.id },
    data: {
      refreshToken,
    },
  });

  // logger.info("Access token refreshed", { email: user.email });

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, "Access token refreshed successfully", null));
});

export const logoutAllSessions = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { refreshToken } = req.cookies;

  await prisma.session.deleteMany({
    where: {
      id,
      NOT: {
        refreshToken,
      },
    },
  });

  res
    .status(ResponseStatus.Success)
    .json(
      new ApiResponse(
        ResponseStatus.Success,
        "Logged out from all other sessions",
        null
      )
    );
});

export const getActiveSessions = asyncHandler(async (req, res) => {
  const { id: userId } = req.user;

  const sessions = await prisma.session.findMany({
    where: { userId },
    select: {
      id: true,
      ipAddress: true,
      userAgent: true,
      createdAt: true,
      expiresAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res
    .status(ResponseStatus.Success)
    .json(
      new ApiResponse(
        ResponseStatus.Success,
        "Fetched all active sessions successfully",
        sessions
      )
    );
});
