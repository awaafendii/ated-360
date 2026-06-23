import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

// On valide les variables d'environnement au démarrage :
// si une variable critique manque, l'application refuse de démarrer
// plutôt que d'échouer silencieusement plus tard.
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL est requis"),
  JWT_SECRET: z
    .string()
    .min(16, "JWT_SECRET doit faire au moins 16 caractères"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().min(8).max(15).default(12),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Configuration d'environnement invalide :");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const corsOrigins = env.CORS_ORIGIN.split(",").map((o) => o.trim());
