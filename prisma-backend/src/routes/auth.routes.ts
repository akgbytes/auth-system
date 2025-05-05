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

router.post("/register", upload.single("avatar"), register);
router.get("/verify/:token", verifyEmail);
router.post("/email/resend", resendVerificationEmail);
router.post("/login", login);
router.post("/password/forgot", forgotPassword);
router.post("/password/reset/:token", resetPassword);
router.get("/refresh-token", refreshAccessToken);

router.post("/logout", isLoggedIn, logout);
router.post("/logout/all", isLoggedIn, logoutAllSessions);
router.get("/sessions", isLoggedIn, getActiveSessions);

export default router;
