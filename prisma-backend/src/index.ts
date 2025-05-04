import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { env } from "./configs/env";
import { logger } from "./configs/logger";

const app = express();
const PORT = env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

import healthRoutes from "./routes/healthCheck.routes";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middlewares/error.middlewares";
app.use("/api/v1/healthCheck", healthRoutes);
app.use("/api/v1/auth", authRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server is running on port: ${PORT}`);
});
