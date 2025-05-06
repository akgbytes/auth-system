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
} from "../controllers/auth.controllers";
import { upload } from "../middlewares/multer.middlewares";
import { isLoggedIn } from "../middlewares/auth.middlewares";
import { authRateLimiter } from "../middlewares/rateLimiter";

router.post("/register", authRateLimiter, upload.single("avatar"), register);
router.get("/verify/:token", verifyEmail);
router.post("/email/resend", authRateLimiter, resendVerificationEmail);
router.post("/login", authRateLimiter, login);
router.post("/password/forgot", authRateLimiter, forgotPassword);
router.post("/password/reset/:token", resetPassword);
router.get("/refresh-token", refreshAccessToken);

router.post("/logout", isLoggedIn, logout);
router.post("/logout/all", isLoggedIn, logoutAllSessions);
router.get("/sessions", isLoggedIn, getActiveSessions);
router.delete("/sessions/:sessionId", isLoggedIn, getActiveSessions);

export default router;
