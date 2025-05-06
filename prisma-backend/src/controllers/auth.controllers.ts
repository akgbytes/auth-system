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
  passwordMatch,
} from "../utils/helper";
import { sendResetPasswordMail, sendVerificationMail } from "../utils/sendMail";
import {
  validateEmail,
  validateLogin,
  validatePassword,
  validateRegister,
} from "../validations/auth.validation";
import { sanitizeUser } from "../utils/sanitizeUser";
import { decodedUser } from "../types";
import { verifyGoogleToken } from "../utils/verifyGoogleToken";

export const register = asyncHandler(async (req, res) => {
  const { username, email, password, fullname } = handleZodError(
    validateRegister(req.body)
  );

  logger.info(`Registration attempt for ${email}`);

  const [existingEmail, existingUsername] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { username } }),
  ]);

  if (existingEmail) {
    throw new CustomError(
      ResponseStatus.Conflict,
      "Email is already registered"
    );
  }

  if (existingUsername) {
    throw new CustomError(ResponseStatus.Conflict, "Username is already taken");
  }

  const hashedPassword = await hashPassword(password);
  const { unHashedToken, hashedToken, tokenExpiry } = generateToken();

  let avatarUrl;
  if (req.file) {
    try {
      const uploaded = await uploadOnCloudinary(req.file.path);
      avatarUrl = uploaded?.secure_url;
      logger.info(`Avatar uploaded for ${email}`);
    } catch (err: any) {
      logger.warn(`Avatar upload failed for ${email} due to ${err.message}`);
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

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const expiresAt = new Date(
    Date.now() + ms(env.REFRESH_TOKEN_EXPIRY as StringValue)
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    },
  });

  await prisma.session.create({
    data: {
      userId: user.id,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
      refreshToken,
      expiresAt,
    },
  });

  logger.info(`Email verified ${user.email}`);

  res
    .status(ResponseStatus.Success)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
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

  const isPasswordCorrect = await passwordMatch(
    password,
    user.password as string
  );

  if (!isPasswordCorrect) {
    throw new CustomError(ResponseStatus.Unauthorized, "Invalid credentials");
  }

  const userAgent = req.headers["user-agent"];
  const ipAddress = req.ip;

  const existingSession = await prisma.session.findFirst({
    where: {
      userId: user.id,
      userAgent,
      ipAddress,
    },
  });

  const existingSessionsCount = await prisma.session.count({
    where: { userId: user.id },
  });

  // Enforce session limit only if new session is being created
  if (!existingSession && existingSessionsCount >= env.MAX_SESSIONS) {
    throw new CustomError(
      ResponseStatus.TooManyRequests,
      "Maximum session limit reached. Please logout from another device first."
    );
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const expiresAt = new Date(
    Date.now() + ms(env.REFRESH_TOKEN_EXPIRY as StringValue)
  );

  if (existingSession) {
    // Update refreshToken + expiry for existing session
    await prisma.session.update({
      where: { id: existingSession.id },
      data: {
        refreshToken,
        expiresAt,
      },
    });
  } else {
    // Create new session
    await prisma.session.create({
      data: {
        userId: user.id,
        userAgent,
        ipAddress,
        refreshToken,
        expiresAt,
      },
    });
  }

  logger.info("User logged in", { email: user.email });

  res
    .status(ResponseStatus.Success)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(ResponseStatus.Success, "Login successful", null));
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new CustomError(ResponseStatus.BadRequest, "Refresh token missing");
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

  logger.info(`Password reset email sent to ${user.email}`);

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
  const { password } = handleZodError(validatePassword(req.body));

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

  if (user.password === hashedPassword) {
    throw new CustomError(
      ResponseStatus.BadRequest,
      "Password must be different than old password"
    );
  }

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

  logger.info(`Password reset successful for ${user.email}`);

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
    throw new CustomError(
      ResponseStatus.Unauthorized,
      "Invalid or expired refresh token"
    );
  }

  const validToken = await prisma.session.findUnique({
    where: { refreshToken: incomingRefreshToken },
  });

  if (!validToken) {
    throw new CustomError(
      ResponseStatus.Unauthorized,
      "Refresh token has been used or is invalid"
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

  logger.info("Access token refreshed");

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, "Access token refreshed successfully", null));
});

export const logoutAllSessions = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { refreshToken } = req.cookies;

  const result = await prisma.session.deleteMany({
    where: {
      userId: id,
      NOT: {
        refreshToken,
      },
    },
  });

  logger.info("Logged out from all other sessions");

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
      refreshToken: true,
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

export const logoutSpecificSession = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { sessionId } = req.params;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.userId !== id) {
    throw new CustomError(ResponseStatus.Unauthorized, "Invalid session ID");
  }

  await prisma.session.delete({ where: { id: sessionId } });

  logger.info("User logged out of specific session");

  res
    .status(ResponseStatus.Success)
    .json(
      new ApiResponse(
        ResponseStatus.Success,
        "Logged out of specific session successfully",
        null
      )
    );
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  const payload = await verifyGoogleToken(credential);

  const { email, name, picture } = payload;

  if (!email || !name || !picture) {
    throw new CustomError(200, "");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  let user = existingUser;

  // Creating new user
  if (!user) {
    const baseUsername = email.split("@")[0];
    let username = baseUsername;

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      username = `${baseUsername}_${crypto.randomUUID().slice(0, 6)}`;
    }

    user = await prisma.user.create({
      data: {
        email,
        fullname: name,
        isEmailVerified: true,
        avatar: picture,
        username,
        provider: "google",
      },
    });
  }

  // Creating a session for existing user

  const userAgent = req.headers["user-agent"];
  const ipAddress = req.ip;

  const existingSession = await prisma.session.findFirst({
    where: {
      userId: user.id,
      userAgent,
      ipAddress,
    },
  });

  const existingSessionsCount = await prisma.session.count({
    where: { userId: user.id },
  });

  // Enforce session limit only if new session is being created
  if (!existingSession && existingSessionsCount >= env.MAX_SESSIONS) {
    throw new CustomError(
      ResponseStatus.TooManyRequests,
      "Maximum session limit reached. Please logout from another device first."
    );
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const expiresAt = new Date(
    Date.now() + ms(env.REFRESH_TOKEN_EXPIRY as StringValue)
  );

  if (existingSession) {
    // Update refreshToken + expiry for existing session
    await prisma.session.update({
      where: { id: existingSession.id },
      data: {
        refreshToken,
        expiresAt,
      },
    });
  } else {
    // Create new session
    await prisma.session.create({
      data: {
        userId: user.id,
        userAgent,
        ipAddress,
        refreshToken,
        expiresAt,
      },
    });
  }

  logger.info(`${email} logged in via Google`);

  res
    .status(ResponseStatus.Success)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(ResponseStatus.Success, "Google login successful", null)
    );
});
