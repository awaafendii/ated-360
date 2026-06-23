import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";
import { signToken } from "../../utils/jwt.js";
import { conflict, unauthorized, notFound } from "../../utils/AppError.js";

function publicUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    producer: user.producer
      ? {
          id: user.producer.id,
          zone: user.producer.zone,
          farmType: user.producer.farmType,
          poultryCount: user.producer.poultryCount,
          hectares: user.producer.hectares,
        }
      : null,
  };
}

export async function register(input) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw conflict("Un compte existe déjà avec cet e-mail");

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);

  // On crée l'utilisateur et, si producteur, son profil de ferme en une transaction.
  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: input.role,
      producer:
        input.role === "PRODUCTEUR"
          ? {
              create: {
                zone: input.zone,
                farmType: input.farmType ?? "MIXTE",
              },
            }
          : undefined,
    },
    include: { producer: true },
  });

  const token = signToken({ sub: user.id, role: user.role });
  return { token, user: publicUser(user) };
}

export async function login(input) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { producer: true },
  });
  if (!user) throw unauthorized("E-mail ou mot de passe incorrect");

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw unauthorized("E-mail ou mot de passe incorrect");

  const token = signToken({ sub: user.id, role: user.role });
  return { token, user: publicUser(user) };
}

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { producer: true },
  });
  if (!user) throw notFound("Compte introuvable");
  return publicUser(user);
}
