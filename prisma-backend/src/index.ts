import express from "express";
import env from "./configs/env";
import logger from "./configs/logger";

const app = express();
const PORT = env.PORT;

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(PORT, () => {
  logger.info(`Server is running on port: ${PORT}`);
});
