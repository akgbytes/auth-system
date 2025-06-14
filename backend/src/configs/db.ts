import { PrismaClient } from "../generated/prisma";
import { logger } from "./logger";

export const prisma = new PrismaClient();

async function connectPrisma() {
  try {
    await prisma.$connect();
    logger.info("Prisma connected to the database");
  } catch (error) {
    logger.error("Prisma failed to connect to the database", error);
    process.exit(1);
  }
}

connectPrisma();
