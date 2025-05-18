import { PrismaClient } from "../generated/prisma";
import { logger } from "./logger";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

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
