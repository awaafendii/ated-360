// Erreur applicative typée : porte un code HTTP et un message sûr à exposer.
// Toute erreur "attendue" (validation, non trouvé, non autorisé...) passe par là.
export class AppError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

// Raccourcis sémantiques
export const badRequest = (msg, details) => new AppError(400, msg, details);
export const unauthorized = (msg = "Authentification requise") => new AppError(401, msg);
export const forbidden = (msg = "Accès refusé") => new AppError(403, msg);
export const notFound = (msg = "Ressource introuvable") => new AppError(404, msg);
export const conflict = (msg) => new AppError(409, msg);
