import { PrismaClient } from "../../prisma/generated/prisma/client/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// @ts-expect-error
export const db = globalForPrisma.prisma ?? new PrismaClient({ accelerateUrl: process.env.DATABASE_URL || "postgres://dummy" });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
