import { PrismaClient } from "../../prisma/generated/prisma/client/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const rawConnStr = process.env.DATABASE_URL || "";
const isPlaceholder = !rawConnStr || rawConnStr.includes("hostname") || rawConnStr.includes("dummy") || rawConnStr.includes("user:password");

function getClient(): PrismaClient {
  let connectionString = rawConnStr;
  if (!connectionString || isPlaceholder) {
    connectionString = "postgresql://dummy:dummy@localhost:5432/dummy";
  } else if (
    (connectionString.includes("sslmode=require") ||
     connectionString.includes("sslmode=prefer") ||
     connectionString.includes("sslmode=verify-ca")) &&
    !connectionString.includes("uselibpqcompat=")
  ) {
    const separator = connectionString.includes("?") ? "&" : "?";
    connectionString = `${connectionString}${separator}uselibpqcompat=true`;
  }

  try {
    const pool = new Pool({ connectionString, connectionTimeoutMillis: 2000 });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  } catch (e) {
    const pool = new Pool({ connectionString: "postgresql://dummy:dummy@localhost:5432/dummy" });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }
}

export const db = globalForPrisma.prisma ?? getClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

