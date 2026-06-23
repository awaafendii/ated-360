import { prisma } from "../../config/prisma.js";
import { notFound } from "../../utils/AppError.js";
import { computeScore } from "../score/score.service.js";

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
    },
  });
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
