import { Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

// Route inexistante
export function notFoundHandler(req, _res, next) {
  next(new AppError(404, `Route introuvable : ${req.method} ${req.originalUrl}`));
}

// Gestionnaire d'erreurs final (4 arguments => Express le reconnaît comme tel).
export function errorHandler(err, _req, res, _next) {
  // 1) Erreurs applicatives maîtrisées
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, ...(err.details ? { details: err.details } : {}) },
    });
  }

  // 2) Erreurs Prisma connues -> messages clairs
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const champ = err.meta?.target?.join(", ") || "champ";
      return res.status(409).json({
        success: false,
        error: { message: `Valeur déjà utilisée (${champ})` },
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: { message: "Ressource introuvable" },
      });
    }
  }

  // 3) Erreur inattendue -> 500, on logge la stack côté serveur uniquement.
  console.error("💥 Erreur non gérée :", err);
  return res.status(500).json({
    success: false,
    error: {
      message: "Erreur interne du serveur",
      ...(env.NODE_ENV === "development" ? { stack: err.stack } : {}),
    },
  });
}
