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
app.use("/api/v1/healthCheck", healthRoutes);

app.listen(PORT, () => {
  logger.info(`Server is running on port: ${PORT}`);
});
