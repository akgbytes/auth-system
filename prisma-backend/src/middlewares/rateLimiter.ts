import rateLimit from "express-rate-limit";
import { ResponseStatus } from "../utils/constants";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 requests per windowMs
  message: {
    statusCode: ResponseStatus.TooManyRequests,
    message: "Too many requests, please try again later",
    data: null,
    success: false,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
