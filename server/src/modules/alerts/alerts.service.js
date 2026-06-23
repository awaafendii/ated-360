import { prisma } from "../../config/prisma.js";
import { notFound } from "../../utils/AppError.js";

export async function listAlerts(producerId, { priority, resolved } = {}) {
  const where = {
    producerId,
    ...(priority ? { priority } : {}),
    ...(resolved !== undefined ? { resolved } : {}),
  };
  // Tri : urgent d'abord, puis par échéance la plus proche.
  const alerts = await prisma.alert.findMany({
    where,
    orderBy: [{ priority: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
  });
  return alerts;
}

export async function createAlert(producerId, input) {
  return prisma.alert.create({
    data: {
      producerId,
      priority: input.priority,
      kind: input.kind,
      title: input.title,
      description: input.description,
      dueAt: input.dueAt ?? null,
    },
  });
}

export async function resolveAlert(producerId, id) {
  const alert = await prisma.alert.findFirst({ where: { id, producerId } });
  if (!alert) throw notFound("Alerte introuvable");
  return prisma.alert.update({ where: { id }, data: { resolved: true } });
}

export async function getSummary(producerId) {
  const [urgent, normal, info, total] = await Promise.all([
    prisma.alert.count({ where: { producerId, priority: "URGENT", resolved: false } }),
    prisma.alert.count({ where: { producerId, priority: "NORMAL", resolved: false } }),
    prisma.alert.count({ where: { producerId, priority: "INFO", resolved: false } }),
    prisma.alert.count({ where: { producerId, resolved: false } }),
  ]);
  return { urgent, normal, info, total };
}
