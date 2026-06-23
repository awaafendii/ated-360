import { badRequest } from "../utils/AppError.js";

// Valide une partie de la requête contre un schéma Zod.
// `source` : "body" | "params" | "query".
// En cas de succès, remplace req[source] par les données parsées (typées/nettoyées).
export const validate = (schema, source = "body") => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      champ: i.path.join("."),
      message: i.message,
    }));
    return next(badRequest("Données invalides", details));
  }
  req[source] = result.data;
  next();
};
