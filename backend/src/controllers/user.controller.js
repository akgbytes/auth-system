import User from "../models/User.model.js";
import generateToken from "../utils/generateToken.js";
import sendMail from "../utils/sendMail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // validating inputs
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
      success: false,
    });
  }

  try {
    // checking if user already exists in db
    const existingUser = await User.findOne({ email });

    if (existingUser)
      return res.status(400).json({
        message: "User already exists, Please try to login!",
        success: false,
      });

    // creating user in db
    const user = await User.create({
      name,
      email,
      password,
    });

    if (!user)
      return res.status(400).json({
        message: "Please register again!",
        success: false,
      });

    // creating verificationToken
    const token = generateToken();
    user.verificationToken = token;
    await user.save();

    // sending email
    await sendMail(token, user.email);

    res.status(200).json({
      message: "User registered successfully",
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

const verifyUser = async (req, res) => {
  const { token } = req.params;
  if (!token)
    return res.status(400).json({
      message: "Invalid token",
      success: false,
    });

  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user)
      return res.status(400).json({
        message: "Invalid token",
        success: false,
      });

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({
      message: "User verified successfully!",
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "All fields are required",
      success: false,
    });
  }
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(400).json({
        message: "User does not exists",
        success: false,
      });
    }

    const isTrue = await bcrypt.compare(password, user.password);

    if (!isTrue)
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });

    const { accessToken, refreshToken } = user.generateAccessAndRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();

    console.log("accessToken : ", accessToken);
    console.log("refreshToken : ", refreshToken);

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 4 * 1000,
    };
    res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({
        success: true,
        message: "User logged in successfully!!",
      });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

const logoutUser = async (req, res) => {
  const decoded = jwt.verify(currentToken, process.env.JWT_SECRET_KEY);
  const userId = decoded.id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(400).json({
      message: "User does not exists",
      success: false,
    });
  }
  user.refreshToken = null;
  await user.save();

  res.clearCookie("accessToken").clearCookie("refreshToken").status(200).json({
    success: true,
    message: "Logged out successfully!!",
  });
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();

    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false,
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.MAILTRAP_SENDERMAIL,
      to: user.email,
      subject: "Reset your Password",
      text: `Please click on the link ${process.env.BASE_URI}/api/v1/users/reset-password/${token}`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: "Reset Link Successfully!!",
    });
  } catch (error) {
    console.log("error: ", error);
    return res.status(500).json({
      message: "Internal Server Down!!",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    console.log("token: ", token);
    if (!token) {
      return res.status(400).json({
        success: true,
        message: "Invalid Token",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: true,
        message: "Please enter password",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found!!",
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();

    return res.status(200).json({
      message: "Password reset succesfully",
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Down",
      error: error.message,
    });
  }
};

const getRefreshAcessToken = async (req, res) => {
  const currentToken = req.cookies.refreshToken;
  try {
    const decoded = jwt.verify(currentToken, process.env.JWT_SECRET_KEY);
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        message: "User does not exists",
        success: false,
      });
    }

    if (currentToken !== user.refreshToken) {
      return res.status(400).json({
        message: "Session Expired",
        success: false,
      });
    }

    const { accessToken, refreshToken } = user.generateAccessAndRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 4 * 1000,
    };
    res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({
        success: true,
        message: "Token refreshed successfully!",
      });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  registerUser,
  verifyUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getRefreshAcessToken,
};
