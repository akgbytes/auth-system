import { z } from "zod";
import dotenv from "dotenv";
import { logger } from "./logger";
import { NodeEnv } from "../utils/constants";

dotenv.config();

const validNumber = (name: string) =>
  z.preprocess(
    (val) => Number(val),
    z.number({
      required_error: `${name} is required`,
      invalid_type_error: `${name} must be a number`,
    }),
  );

const validURL = (name: string) =>
  z
    .string({
      required_error: `${name} is required`,
      invalid_type_error: `${name} must be a valid URL string`,
    })
    .url(`${name} must be a valid URL`);

const nonEmptyString = (name: string) =>
  z
    .string({
      required_error: `${name} is required`,
      invalid_type_error: `${name} must be a string`,
    })
    .nonempty(`${name} cannot be empty`);

const envSchema = z.object({
  PORT: validNumber("PORT"),

  DATABASE_URL: validURL("DATABASE_URL"),

  ACCESS_TOKEN_SECRET: nonEmptyString("ACCESS_TOKEN_SECRET"),
  ACCESS_TOKEN_EXPIRY: nonEmptyString("ACCESS_TOKEN_EXPIRY"),
  REFRESH_TOKEN_SECRET: nonEmptyString("REFRESH_TOKEN_SECRET"),
  REFRESH_TOKEN_EXPIRY: nonEmptyString("REFRESH_TOKEN_EXPIRY"),
  REFRESH_TOKEN_EXPIRY_REMEMBER_ME: nonEmptyString("REFRESH_TOKEN_EXPIRY_REMEMBER_ME"),

  MAILTRAP_HOST: nonEmptyString("MAILTRAP_HOST"),
  MAILTRAP_PORT: validNumber("MAILTRAP_PORT"),
  MAILTRAP_USERNAME: nonEmptyString(" MAILTRAP_USERNAME"),
  MAILTRAP_PASSWORD: nonEmptyString("MAILTRAP_PASSWORD"),
  MAILTRAP_SENDERMAIL: z.string().email("MAILTRAP_SENDERMAIL must be a valid email"),

  CLOUDINARY_NAME: nonEmptyString("CLOUDINARY_NAME"),
  CLOUDINARY_API_KEY: nonEmptyString("CLOUDINARY_API_KEY"),
  CLOUDINARY_SECRET_KEY: nonEmptyString("CLOUDINARY_SECRET_KEY"),

  SERVER_URL: validURL("SERVER_URL"),
  CLIENT_URL: validURL("CLIENT_URL"),

  NODE_ENV: z.nativeEnum(NodeEnv, {
    errorMap: () => {
      return { message: "NODE_ENV must be 'development' or 'production" };
    },
  }),

  MAX_SESSIONS: validNumber("MAX_SESSIONS"),

  GOOGLE_CLIENT_ID: nonEmptyString("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: nonEmptyString("GOOGLE_CLIENT_ID"),
});

const createEnv = (env: NodeJS.ProcessEnv) => {
  const result = envSchema.safeParse(env);

  if (!result.success) {
    console.log("ressult error: ", result.error);
    const messages = result.error.errors.map((err) => `- ${err.message}`).join("\n");

    logger.error(`Environment variable validation failed\n${messages}`);
    process.exit(1);
  }

  return result.data;
};

export const env = createEnv(process.env);
