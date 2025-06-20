import { Router } from "express";
const router = Router();

import {
  register,
  verifyEmail,
  resendVerificationEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logoutAllSessions,
  getActiveSessions,
  googleLogin,
  logoutSpecificSession,
  getProfile,
} from "../controllers/auth.controller";
import { upload } from "../middlewares/multer.middleware";
import { isLoggedIn } from "../middlewares/auth.middleware";
import {
  authRateLimiter,
  resendVerificationRateLimiter,
  forgotPasswordRateLimiter,
} from "../middlewares/rateLimit.middleware";

router.post(
  "/register",
  authRateLimiter,
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  register,
);
router.get("/verify/:token", verifyEmail);
router.post("/email/resend", resendVerificationRateLimiter, resendVerificationEmail);
router.post("/login", authRateLimiter, login);
router.post("/password/forgot", forgotPasswordRateLimiter, forgotPassword);
router.post("/password/reset/:token", resetPassword);

router.get("/refresh-token", refreshAccessToken);

router.post("/logout", isLoggedIn, logout);
router.post("/logout/all", isLoggedIn, logoutAllSessions);
router.get("/sessions", isLoggedIn, getActiveSessions);
router.post("/sessions/:sessionId", isLoggedIn, logoutSpecificSession);

router.post("/login/google", googleLogin);

router.get("/profile", isLoggedIn, getProfile);

export default router;
