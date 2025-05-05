import { env } from "./configs/env";
import app from "./app";
import { logger } from "./configs/logger";

const PORT: number = env.PORT;

app.listen(PORT, () => {
  logger.info(`Server successfully running on port: ${PORT}`);
});
