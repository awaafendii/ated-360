import { z } from "zod";

const ZONES = ["CONAKRY", "KINDIA", "BOKE", "MAMOU", "LABE", "FARANAH", "KANKAN", "NZEREKORE"];
const FARM_TYPES = ["AVICOLE", "AGRICOLE", "MIXTE"];

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Le nom complet est requis").max(120),
    email: z.string().email("E-mail invalide"),
    phone: z
      .string()
      .regex(/^\+?[0-9\s-]{6,20}$/, "Numéro de téléphone invalide")
      .optional(),
    password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères").max(100),
    role: z.enum(["PRODUCTEUR", "PARTENAIRE"]).default("PRODUCTEUR"),
    // Champs requis seulement pour un PRODUCTEUR
    zone: z.enum(ZONES).optional(),
    farmType: z.enum(FARM_TYPES).optional(),
  })
  .refine((d) => d.role !== "PRODUCTEUR" || !!d.zone, {
    message: "La zone d'exploitation est requise pour un producteur",
    path: ["zone"],
  });

export const loginSchema = z.object({
  email: z.string().email("E-mail invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});
