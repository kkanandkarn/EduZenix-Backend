import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env["DATABASE_URL"];

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Prisma 7 has no built-in query engine — the driver adapter supplies the
// Postgres connection pool.
const adapter = new PrismaPg({ connectionString });

// tsx reloads modules on change in dev, which would otherwise open a new pool
// on every save. Cache the client on globalThis so reloads reuse one instance.
const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env["NODE_ENV"] === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (process.env["NODE_ENV"] !== "production") {
  globalForPrisma.prisma = prisma;
}

// Opening the pool is lazy by default — Prisma would connect on the first
// query of every worker. Call this once at boot so the connection is
// established (and verified) up front and reused by every request.
let connectPromise: Promise<void> | undefined;

export const connectDB = (): Promise<void> => {
  connectPromise ??= prisma
    .$connect()
    .then(() => {
      console.log("Database connected");
    })
    .catch((error: unknown) => {
      connectPromise = undefined;
      console.error("Database connection failed:", error);
      throw error;
    });

  return connectPromise;
};

export const disconnectDB = async (): Promise<void> => {
  connectPromise = undefined;
  await prisma.$disconnect();
};
