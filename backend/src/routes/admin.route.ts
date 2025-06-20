import { Router } from "express";

import { isLoggedIn } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/role.middleware";
import {
  deleteUserById,
  logoutUserSession,
  getAllUsers,
  getUserById,
  updateUserRole,
} from "../controllers/admin.controller";

const router = Router();

router.get("/users", isLoggedIn, isAdmin, getAllUsers);
router.get("/users/:userId", isLoggedIn, isAdmin, getUserById);
router.post("/users/session/:sessionId", isLoggedIn, isAdmin, logoutUserSession);
router.patch("/users/:userId", isLoggedIn, isAdmin, updateUserRole);
router.delete("/users/:userId", isLoggedIn, isAdmin, deleteUserById);

export default router;
