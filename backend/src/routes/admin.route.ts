import { Router } from "express";
import { updateProfile, changePassword, getProfile } from "../controllers/user.controller";

import { isLoggedIn } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/role.middleware";

const router = Router();

router.get("/users", isLoggedIn, isAdmin);
router.get("/users/:userId", isLoggedIn, isAdmin);
router.patch("/users/:userId", isLoggedIn, isAdmin);
router.delete("/users/:userId", isLoggedIn, isAdmin);

export default router;
