import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.court.upsert({
    where: { name: "Pista 1" },
    update: {},
    create: { name: "Pista 1" },
  });
  await prisma.court.upsert({
    where: { name: "Pista 2" },
    update: {},
    create: { name: "Pista 2" },
  });

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    console.warn(
      "ADMIN_USERNAME / ADMIN_PASSWORD no definidos: no se crea el usuario admin."
    );
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.member.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      nombre: "Administrador",
      portal: "-",
      planta: "-",
      puerta: "-",
      username: adminUsername,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Seed completado: Pista 1, Pista 2 y usuario admin listos.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
