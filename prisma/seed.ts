// prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import bcrypt from "bcryptjs";

const connectionString = `${process.env.DATABASE_URL || "postgresql://dummy:dummy@dummy/dummy"}`;
const pool = new Pool({ connectionString });

// Parse and set the PostgreSQL schema (search_path) automatically
if (process.env.DATABASE_URL) {
  try {
    const parsedUrl = new URL(process.env.DATABASE_URL);
    const schema = parsedUrl.searchParams.get("schema") || "public";
    pool.on("connect", (client) => {
      client.query(`SET search_path TO ${schema};`).catch((e) => {
        console.error("Failed to set search_path in seed.ts:", e);
      });
    });
  } catch (err) {
    console.warn("Failed to parse DATABASE_URL in seed.ts:", err);
  }
}

const parsedUrl = new URL(connectionString);
const schema = parsedUrl.searchParams.get("schema") || "public";
const adapter = new PrismaPg(pool, { schema });
const prisma = new PrismaClient({ adapter, log: ["query"] });

async function main() {
  const hashed = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "athlete@example.com" },
    update: {},
    create: {
      name: "Alex Johnson",
      email: "athlete@example.com",
      passwordHash: hashed,
      role: "ATHLETE",
    },
  });
  await prisma.user.upsert({
    where: { email: "brand@example.com" },
    update: {},
    create: {
      name: "Nike Deals Team",
      email: "brand@example.com",
      passwordHash: hashed,
      role: "BRAND_REPRESENTATIVE",
    },
  });
  console.log("✅ Seeded users");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
