import { verifyToken } from "../utils/jwt.js";
import { unauthorized, forbidden } from "../utils/AppError.js";
import { prisma } from "../config/prisma.js";

// Vérifie le token Bearer, charge l'utilisateur et l'attache à req.user.
export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw unauthorized("Token d'authentification manquant");
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw unauthorized("Token invalide ou expiré");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { producer: true },
    });

    if (!user) throw unauthorized("Compte introuvable");

    req.user = {
      id: user.id,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      producerId: user.producer?.id ?? null,
    };
    next();
  } catch (err) {
    next(err);
  }
}

// Restreint l'accès à certains rôles. Ex : authorize("PARTENAIRE")
export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(forbidden("Votre rôle ne permet pas cette action"));
    }
    next();
  };
}
