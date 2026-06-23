import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

// Singleton : un seul pool de connexions pour toute l'application.
// En développement, on évite de recréer le client à chaque hot-reload.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
