import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import { env } from "./env";
import { CustomError } from "../utils/CustomError";
import { ResponseStatus } from "../utils/constants";

cloudinary.config({
  cloud_name: env.CLOUDINARY_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_SECRET_KEY,
});

export const uploadOnCloudinary = async (localFilePath: string) => {
  if (!localFilePath) {
    throw new CustomError(ResponseStatus.BadRequest, "No file path provided");
  }

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    return response;
  } catch (error: any) {
    throw new CustomError(ResponseStatus.InternalServerError, error.message);
  } finally {
    try {
      await fs.unlink(localFilePath);
    } catch (unlinkErr) {
      console.warn(`Failed to delete local file: ${localFilePath}`, unlinkErr);
    }
  }
};
