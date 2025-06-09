import { Router } from "express";
import { updateProfile, changePassword, getProfile } from "../controllers/user.controllers";
import { upload } from "../middlewares/multer.middlewares";
import { isLoggedIn } from "../middlewares/auth.middlewares";

const router = Router();

router.get("/profile", isLoggedIn, getProfile);
router.put("/password", isLoggedIn, changePassword);

export default router;
