import { Router } from "express";

import { isLoggedIn } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/role.middleware";
import {
  deleteUserById,
  deleteUserSessionById,
  getAllUsers,
  getUserById,
  updateUserRole,
} from "../controllers/admin.controller";

const router = Router();

router.get("/users", isLoggedIn, isAdmin, getAllUsers);
router.get("/users/:userId", isLoggedIn, isAdmin, getUserById);
router.patch("/users/:userId", isLoggedIn, isAdmin, updateUserRole);
router.delete("/users/:userId", isLoggedIn, isAdmin, deleteUserById);
router.delete("/users/sessions/:sessionId", isLoggedIn, isAdmin, deleteUserSessionById);

export default router;
