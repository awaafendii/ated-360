import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

import { env, corsOrigins } from "./config/env.js";
import { notFoundHandler, errorHandler } from "./middlewares/error.js";

import authRoutes from "./modules/auth/auth.routes.js";
import producersRoutes from "./modules/producers/producers.routes.js";
import recordsRoutes from "./modules/records/records.routes.js";
import alertsRoutes from "./modules/alerts/alerts.routes.js";
import scoreRoutes from "./modules/score/score.routes.js";
import dronesRoutes from "./modules/drones/drones.routes.js";
import partnersRoutes from "./modules/partners/partners.routes.js";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);

  // --- Sécurité & utilitaires ---
  app.use(
    helmet({
      // CSP désactivée ici car le frontend est servi par le même origine ;
      // CRA gère ses propres assets. Réactivez/affinez en production selon vos besoins.
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(
    cors({
      origin(origin, cb) {
        // Pas d'origin (curl, mobile) : autorisé.
        if (!origin) return cb(null, true);
        // Le proxy de dev de Create React App (client/package.json "proxy") réécrit
        // l'en-tête Origin vers l'URL cible avec un slash final (ex: "http://localhost:4000/") :
        // on l'ignore pour comparer les origines localhost entre elles.
        const normalized = origin.replace(/\/+$/, "");
        // localhost (développement) : autorisé.
        if (/^http:\/\/localhost:\d+$/.test(normalized)) return cb(null, true);
        // Origines déclarées dans CORS_ORIGIN (production) : autorisées.
        if (corsOrigins.includes(normalized)) return cb(null, true);
        cb(new Error("Origine non autorisée par CORS"));
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  if (env.NODE_ENV !== "test") app.use(morgan("dev"));

  // Limiteur global anti-abus (300 req / 15 min / IP).
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, error: { message: "Trop de requêtes, réessayez plus tard" } },
    })
  );

  // Limiteur renforcé sur l'authentification (anti brute-force).
  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

  // --- Santé ---
  app.get("/api/health", (_req, res) =>
    res.json({ success: true, data: { status: "ok", service: "ated-360-api", time: new Date().toISOString() } })
  );

  // --- Routes métier ---
  app.use("/api/auth", authLimiter, authRoutes);
  app.use("/api/producers", producersRoutes);
  app.use("/api/records", recordsRoutes);
  app.use("/api/alerts", alertsRoutes);
  app.use("/api/score", scoreRoutes);
  app.use("/api/drones", dronesRoutes);
  app.use("/api/partners", partnersRoutes);

  // --- 404 pour les routes API inconnues uniquement ---
  app.use("/api", notFoundHandler);

  // --- En production : servir le frontend React compilé ---
  // Le client (Create React App) produit un dossier `build/`.
  // On le sert en statique et on renvoie index.html pour toute route
  // non-API (routing côté client).
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const clientBuild = path.resolve(__dirname, "../../client/build");

  if (fs.existsSync(clientBuild)) {
    app.use(express.static(clientBuild));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      res.sendFile(path.join(clientBuild, "index.html"));
    });
  }

  // --- Gestion d'erreurs (toujours en dernier) ---
  app.use(errorHandler);

  return app;
}
