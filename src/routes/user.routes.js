import express from "express";
const router = express.Router();

import { registerUser, verifyUser } from "../controllers/user.controller.js";

router.post("/register", registerUser);
router.get("/verify/:token", verifyUser);

export default router;
