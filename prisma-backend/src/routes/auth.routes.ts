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
  getMe,
} from "../controllers/auth.controllers";
import { upload } from "../middlewares/multer.middlewares";

router.post("/register", upload.single("avatar"), register);
router.get("/verify/:token", verifyEmail);
router.post("/email/resend", resendVerificationEmail);
router.post("/login", login);
router.post("/logout", logout);
router.post("/password/forgot", forgotPassword);
router.post("/password/reset/:token", resetPassword);
router.get("/refresh-token", refreshAccessToken);
router.get("/me", getMe);

export default router;
