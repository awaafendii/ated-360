import { z } from "zod";

const ZONES = ["CONAKRY", "KINDIA", "BOKE", "MAMOU", "LABE", "FARANAH", "KANKAN", "NZEREKORE"];

// Détails spécifiques par filière (tous optionnels, stockés en JSON).
const aviculturalDetails = z.object({
  espece: z.string().max(60).optional(),
  effectif: z.coerce.number().int().nonnegative().optional(),
  ageSemaines: z.coerce.number().int().nonnegative().optional(),
  mortalitePct: z.coerce.number().min(0).max(100).optional(),
  vaccin: z.string().max(60).optional(),
  ponteParJour: z.coerce.number().int().nonnegative().optional(),
});

const agriculturalDetails = z.object({
  culture: z.string().max(60).optional(),
  surfaceHa: z.coerce.number().nonnegative().optional(),
  phase: z.string().max(60).optional(),
  typeSol: z.string().max(60).optional(),
  intrant: z.string().max(120).optional(),
  rendementTHa: z.coerce.number().nonnegative().optional(),
});

export const createRecordSchema = z
  .object({
    type: z.enum(["ALIMENTATION", "VACCINATION", "TRAITEMENT", "RENDEMENT"]),
    farmType: z.enum(["AVICOLE", "AGRICOLE"]),
    detail: z.string().min(2, "La description est requise").max(200),
    quantity: z.string().max(60).optional(),
    zone: z.enum(ZONES),
    occurredAt: z.coerce.date().optional(),
    details: z.union([aviculturalDetails, agriculturalDetails]).optional(),
  })
  .refine(
    (d) =>
      d.farmType !== "AVICOLE" ||
      d.type !== "VACCINATION" ||
      // une vaccination avicole devrait préciser le vaccin
      (d.details && "vaccin" in d.details),
    { message: "Précisez le vaccin pour une vaccination avicole", path: ["details", "vaccin"] }
  );

export const listRecordsQuerySchema = z.object({
  type: z.enum(["ALIMENTATION", "VACCINATION", "TRAITEMENT", "RENDEMENT"]).optional(),
  farmType: z.enum(["AVICOLE", "AGRICOLE"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
