import { Router } from "express";
import { healthCheck } from "../controllers/healthCheck.controllers";

const router = Router();

router.get("/", healthCheck);

export default router;
