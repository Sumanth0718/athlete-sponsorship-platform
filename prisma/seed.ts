// prisma/seed.ts
import { PrismaClient } from "./generated/prisma/client/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";


const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

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
