import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import { env } from "./env";
import { CustomError } from "../utils/CustomError";
import path from "path";
import { logger } from "./logger";

cloudinary.config({
  cloud_name: env.CLOUDINARY_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_SECRET_KEY,
});

export const uploadOnCloudinary = async (localFilePath: string) => {
  if (!localFilePath) {
    throw new CustomError(400, "No file path provided");
  }

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    return response;
  } catch (error: any) {
    throw new CustomError(500, error.message);
  } finally {
    try {
      const absolutePath = path.resolve(localFilePath);
      await fs.unlink(absolutePath);
    } catch (unlinkErr) {
      logger.warn(`Failed to delete local file: ${localFilePath}`, unlinkErr);
    }
  }
};
