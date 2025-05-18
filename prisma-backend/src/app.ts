import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import healthRoutes from "./routes/healthCheck.routes";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middlewares/error.middlewares";
import { env } from "./configs/env";

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true, // allow cookies n authorization headers
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/api/v1/healthcheck", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use(errorHandler);

export default app;
