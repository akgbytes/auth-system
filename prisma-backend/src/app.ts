import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

import healthRoutes from "./routes/healthCheck.routes";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middlewares/error.middlewares";
app.use("/api/v1/healthcheck", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use(errorHandler);

export default app;
