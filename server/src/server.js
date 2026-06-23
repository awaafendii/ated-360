import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`\n🌱 ATED-360 API démarrée`);
  console.log(`   Environnement : ${env.NODE_ENV}`);
  console.log(`   URL           : http://localhost:${env.PORT}/api/health\n`);
});

// Arrêt propre : on ferme le serveur HTTP puis la connexion DB.
async function shutdown(signal) {
  console.log(`\n${signal} reçu — arrêt en cours...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log("Connexions fermées. Au revoir 👋");
    process.exit(0);
  });
  // Filet de sécurité si la fermeture traîne.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  console.error("Rejet de promesse non géré :", reason);
});
