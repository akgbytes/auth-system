import { uploadOnCloudinary } from "../configs/cloudinary";
import { prisma } from "../configs/db";
import { logger } from "../configs/logger";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import { ResponseStatus } from "../utils/constants";
import { CustomError } from "../utils/CustomError";
import { handleZodError } from "../utils/handleZodError";
import { generateToken, hashPassword, hashToken } from "../utils/helper";
import { sendVerificationMail } from "../utils/sendMail";
import {
  validateEmail,
  validateRegister,
} from "../validations/auth.validation";

export const register = asyncHandler(async (req, res) => {
  const { username, email, password, fullname } = handleZodError(
    validateRegister(req.body)
  );

  logger.info("Register attempt by: ", { email });

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new CustomError(
      ResponseStatus.Conflict,
      "Email is already registered"
    );
  }

  const hashedPassword = await hashPassword(password);

  const { unHashedToken, hashedToken, tokenExpiry } = generateToken();

  let uploadedImage;
  if (req.file) {
    uploadedImage = await uploadOnCloudinary(req.file.path);

    logger.info("Avatar uploaded to Cloudinary", { email });
  }

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      fullname,
      avatar: uploadedImage?.secure_url,
      verificationToken: hashedToken,
      verificationTokenExpiry: tokenExpiry,
    },
  });

  await sendVerificationMail(user.fullname, user.email, unHashedToken);
  logger.info("Verification email sent", { email });

  res
    .status(ResponseStatus.Success)
    .json(
      new ApiResponse(
        ResponseStatus.Success,
        "User registered successfully. Please verify your email",
        user
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

  const hashedToken = hashToken(token);

  const user = await prisma.user.findFirst({
    where: {
      verificationToken: hashedToken,
      verificationTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    throw new CustomError(
      ResponseStatus.Unauthorized,
      "Invalid or expired token"
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

  logger.info("User email verified", { email: user.email });

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
      "No account found with this email address."
    );
  }

  if (user.isEmailVerified) {
    throw new CustomError(
      ResponseStatus.BadRequest,
      "Email is already verified"
    );
  }

  const { hashedToken, unHashedToken, tokenExpiry } = generateToken();

  await prisma.user.update({
    where: { email: user.email },
    data: {
      verificationToken: hashedToken,
      verificationTokenExpiry: tokenExpiry,
    },
  });

  await sendVerificationMail(user.fullname, user.email, unHashedToken);

  logger.info("Verification email resent", {
    email: user.email,
  });

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

export const login = asyncHandler(async (req, res) => {});

export const logout = asyncHandler(async (req, res) => {});

export const forgotPassword = asyncHandler(async (req, res) => {});

export const resetPassword = asyncHandler(async (req, res) => {});

export const refreshAccessToken = asyncHandler(async (req, res) => {});

export const getMe = asyncHandler(async (req, res) => {});
