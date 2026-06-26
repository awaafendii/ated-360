import { z } from "zod";

const ZONES = [
  "BEYLA", "BOFFA", "BOKE", "CONAKRY", "COYAH",
  "DABOLA", "DALABA", "DINGUIRAYE", "DUBREKA",
  "FARANAH", "FORECARIAH", "FRIA",
  "GAOUAL", "GUECKEDOU",
  "KANKAN", "KAMSAR", "KEROUANE", "KINDIA", "KISSIDOUGOU",
  "KOUNDARA", "KOUROUSSA", "KOUBIA",
  "LABE", "LELOUMA", "LOLA",
  "MACENTA", "MALI", "MANDIANA", "MAMOU",
  "NZEREKORE",
  "PITA",
  "SANGAREDI", "SIGUIRI",
  "TELIMELE", "TOUGUE",
  "YOMOU",
];
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
    zone: z.enum(ZONES),
    farmType: z.enum(FARM_TYPES).optional(),
  });

export const loginSchema = z.object({
  email: z.string().email("E-mail invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});
