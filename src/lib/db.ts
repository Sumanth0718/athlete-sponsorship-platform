import { PrismaClient } from "../../prisma/generated/prisma/client/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let connectionString = `${process.env.DATABASE_URL || "postgresql://dummy:dummy@dummy/dummy"}`;

// Silence pg security warning regarding SSL modes in newer versions
if (
  (connectionString.includes("sslmode=require") ||
   connectionString.includes("sslmode=prefer") ||
   connectionString.includes("sslmode=verify-ca")) &&
  !connectionString.includes("uselibpqcompat=")
) {
  const separator = connectionString.includes("?") ? "&" : "?";
  connectionString = `${connectionString}${separator}uselibpqcompat=true`;
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
