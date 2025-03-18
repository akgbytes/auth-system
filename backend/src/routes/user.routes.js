import express from "express";
const router = express.Router();

import {
  registerUser,
  verifyUser,
  loginUser,
  logoutUser,
  resetPassword,
  forgotPassword,
  getRefreshAcessToken,
} from "../controllers/user.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

router.post("/register", registerUser);
router.get("/verify/:token", verifyUser);
router.post("/login", loginUser);
router.post("/logout", isLoggedIn, logoutUser);
router.post("/forgot-password", isLoggedIn, forgotPassword);
router.post("/reset-password/:token", isLoggedIn, resetPassword);
router.post("/refresh-token", getRefreshAcessToken);

export default router;
