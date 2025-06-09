import { Router } from "express";
import { updateProfile, changePassword, getProfile } from "../controllers/user.controller";

import { isLoggedIn } from "../middlewares/auth.middleware";

const router = Router();

router.get("/profile", isLoggedIn, getProfile);
router.put("/update", isLoggedIn, updateProfile);
router.put("/password", isLoggedIn, changePassword);

export default router;
