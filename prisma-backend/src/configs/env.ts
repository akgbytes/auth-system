import { z } from "zod";
import dotenv from "dotenv";
import CustomError from "../utils/CustomError";
import { ResponseStatus } from "../utils/constants";

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
  });

  const result = envSchema.safeParse(env);
  if (!result.success) {
    const errorMessages = result.error.errors
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("\n");

    throw new Error(`Error occured in .env \n${errorMessages}`);
  }

  return result.data;
};

const env = createEnv(process.env);
export default env;
