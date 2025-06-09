import { addColors, createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const colors = {
  info: "blue",
  warn: "yellow",
  error: "red",
  http: "cyan",
  debug: "gray",
};

addColors(colors);

const uppercaseFormat = format((info) => {
  info.originalLevel = info.level;
  info.level = info.level.toUpperCase();
  return info;
});

const consoleFormat = format.printf(({ timestamp, level, message, metadata }) => {
  const timeOnly = (timestamp as string).split(" ")[1];
  const metaString = metadata && Object.keys(metadata).length ? `${JSON.stringify(metadata)}` : "";
  return `${timeOnly} [${level}] ${message} ${metaString}`;
});

const baseFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.splat(),
  format.metadata({ fillExcept: ["timestamp", "level", "message", "stack"] }),
);

export const logger = createLogger({
  level: "info",
  format: baseFormat,
  transports: [
    new transports.Console({
      format: format.combine(uppercaseFormat(), format.colorize(), consoleFormat),
    }),
    new DailyRotateFile({
      filename: "logs/%DATE%-combined.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      level: "info",
      format: format.json(),
    }),
    new DailyRotateFile({
      filename: "logs/%DATE%-error.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
      level: "error",
      format: format.json(),
    }),
  ],

  exceptionHandlers: [new transports.File({ filename: "logs/exceptions.log" })],

  rejectionHandlers: [new transports.File({ filename: "logs/rejections.log" })],

  exitOnError: false,
});
