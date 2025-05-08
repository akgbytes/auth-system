import { z } from "zod";
import dotenv from "dotenv";
import { logger } from "./logger";

dotenv.config();

const createEnv = (env: NodeJS.ProcessEnv) => {
  const envSchema = z.object({
    PORT: z.coerce.number({ message: "PORT must be a valid number" }),
    DATABASE_URL: z.string().nonempty(),

    MAILTRAP_HOST: z.string().nonempty(),
    MAILTRAP_PORT: z.coerce.number(),
    MAILTRAP_USERNAME: z.string().nonempty(),
    MAILTRAP_PASSWORD: z.string().nonempty(),
    MAILTRAP_SENDERMAIL: z.string().email(),

    SERVER_URL: z.string().url(),
    CLIENT_URL: z.string().url(),

    ACCESS_TOKEN_SECRET: z.string().nonempty(),
    ACCESS_TOKEN_EXPIRY: z.string().default("1d"),
    REFRESH_TOKEN_SECRET: z.string().nonempty(),
    REFRESH_TOKEN_EXPIRY: z.string().default("7d"),

    CLOUDINARY_NAME: z.string().nonempty(),
    CLOUDINARY_API_KEY: z.string().nonempty(),
    CLOUDINARY_SECRET_KEY: z.string().nonempty(),

    NODE_ENV: z.enum(["development", "production"]),

    MAX_SESSIONS: z.coerce.number({
      message: "Session must be a valid number",
    }),

    GOOGLE_CLIENT_ID: z.string().nonempty(),
    GOOGLE_CLIENT_SECRET: z.string().nonempty(),
  });

  const result = envSchema.safeParse(env);

  if (!result.success) {
    const errorMessages = result.error.errors
      .map((err) => `- ${err.path.join(".")}: ${err.message}`)
      .join("\n");

    logger.error(`Environment variable validation failed:\n${errorMessages}`);
    process.exit(1);
  }

  return result.data;
};

export const env = createEnv(process.env);
