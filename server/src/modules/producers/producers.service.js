import { prisma } from "../../config/prisma.js";
import { notFound, badRequest } from "../../utils/AppError.js";
import { computeScore } from "../score/score.service.js";
import { cloudinaryConfigured, uploadBuffer } from "../../config/cloudinary.js";

export async function updateProfile(producerId, input) {
  const producer = await prisma.producer.findUnique({ where: { id: producerId } });
  if (!producer) throw notFound("Profil producteur introuvable");

  return prisma.producer.update({
    where: { id: producerId },
    data: {
      zone: input.zone ?? producer.zone,
      farmType: input.farmType ?? producer.farmType,
      poultryCount: input.poultryCount ?? producer.poultryCount,
      hectares: input.hectares ?? producer.hectares,
      fieldLocation: input.fieldLocation ?? producer.fieldLocation,
      cultures: input.cultures ?? producer.cultures,
      startYear: input.startYear ?? producer.startYear,
      investedAmount: input.investedAmount ?? producer.investedAmount,
      youthEmployed: input.youthEmployed ?? producer.youthEmployed,
      womenEmployed: input.womenEmployed ?? producer.womenEmployed,
      annualRevenue: input.annualRevenue ?? producer.annualRevenue,
      legalStatus: input.legalStatus ?? producer.legalStatus,
      challenges: input.challenges ?? producer.challenges,
      achievements: input.achievements ?? producer.achievements,
      outlook: input.outlook ?? producer.outlook,
    },
  });
}

const PROOF_TYPES = ["PHOTO", "VIDEO", "DOCUMENT"];

export async function uploadCv(producerId, file) {
  if (!cloudinaryConfigured) throw badRequest("Le stockage de fichiers n'est pas configuré sur ce serveur");
  if (!file) throw badRequest("Aucun fichier reçu");

  const result = await uploadBuffer(file.buffer, { folder: `ated-360/cv/${producerId}`, resourceType: "auto" });
  return prisma.producer.update({ where: { id: producerId }, data: { cvUrl: result.secure_url } });
}

export async function addProof(producerId, file, { type, label }) {
  if (!cloudinaryConfigured) throw badRequest("Le stockage de fichiers n'est pas configuré sur ce serveur");
  if (!file) throw badRequest("Aucun fichier reçu");
  if (!PROOF_TYPES.includes(type)) throw badRequest("Type de preuve invalide");

  const resourceType = type === "VIDEO" ? "video" : type === "DOCUMENT" ? "raw" : "image";
  const result = await uploadBuffer(file.buffer, { folder: `ated-360/proofs/${producerId}`, resourceType });

  return prisma.proof.create({
    data: { producerId, type, label: label || undefined, url: result.secure_url },
  });
}

export async function listProofs(producerId) {
  return prisma.proof.findMany({ where: { producerId }, orderBy: { createdAt: "desc" } });
}

export async function removeProof(producerId, proofId) {
  const proof = await prisma.proof.findUnique({ where: { id: proofId } });
  if (!proof || proof.producerId !== producerId) throw notFound("Preuve introuvable");
  await prisma.proof.delete({ where: { id: proofId } });
}

// Agrège les chiffres clés affichés sur le tableau de bord.
export async function getDashboard(producerId) {
  const producer = await prisma.producer.findUnique({ where: { id: producerId } });
  if (!producer) throw notFound("Profil producteur introuvable");

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [activeAlerts, urgentAlerts, monthlyRecords, recentRecords, score] = await Promise.all([
    prisma.alert.count({ where: { producerId, resolved: false } }),
    prisma.alert.count({ where: { producerId, resolved: false, priority: "URGENT" } }),
    prisma.record.count({ where: { producerId, occurredAt: { gte: monthStart } } }),
    prisma.record.findMany({
      where: { producerId },
      orderBy: { occurredAt: "desc" },
      take: 5,
    }),
    computeScore(producerId, producer.farmType === "AGRICOLE" ? "AGRICOLE" : "AVICOLE"),
  ]);

  return {
    profile: {
      zone: producer.zone,
      farmType: producer.farmType,
      poultryCount: producer.poultryCount,
      hectares: producer.hectares,
      fieldLocation: producer.fieldLocation,
      cultures: producer.cultures,
    },
    stats: {
      poultryCount: producer.poultryCount,
      hectares: producer.hectares,
      monthlyRecords,
      activeAlerts,
      urgentAlerts,
      score: score.global,
    },
    recentRecords,
  };
}
