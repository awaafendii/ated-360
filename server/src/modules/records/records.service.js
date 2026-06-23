import { prisma } from "../../config/prisma.js";
import { notFound } from "../../utils/AppError.js";

// Crée une activité. Certaines saisies déclenchent une alerte automatique
// (ex : une vaccination programme un rappel).
export async function createRecord(producerId, input) {
  const record = await prisma.record.create({
    data: {
      producerId,
      type: input.type,
      farmType: input.farmType,
      detail: input.detail,
      quantity: input.quantity,
      zone: input.zone,
      details: input.details ?? undefined,
      occurredAt: input.occurredAt ?? new Date(),
    },
  });

  await maybeCreateFollowUpAlert(producerId, record);
  return record;
}

// Règles simples d'automatisation. Élargissables sans toucher au contrôleur.
async function maybeCreateFollowUpAlert(producerId, record) {
  if (record.type === "VACCINATION" && record.farmType === "AVICOLE") {
    // Programmer un rappel vaccinal à 21 jours.
    const due = new Date(record.occurredAt);
    due.setDate(due.getDate() + 21);
    await prisma.alert.create({
      data: {
        producerId,
        priority: "NORMAL",
        kind: "VACCIN",
        title: "Rappel vaccinal à prévoir",
        description: `Suite à « ${record.detail} », un rappel est recommandé sous 3 semaines.`,
        dueAt: due,
      },
    });
  }
}

export async function listRecords(producerId, { type, farmType, page, limit }) {
  const where = {
    producerId,
    ...(type ? { type } : {}),
    ...(farmType ? { farmType } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.record.findMany({
      where,
      orderBy: { occurredAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.record.count({ where }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getRecord(producerId, id) {
  const record = await prisma.record.findFirst({ where: { id, producerId } });
  if (!record) throw notFound("Activité introuvable");
  return record;
}

export async function deleteRecord(producerId, id) {
  await getRecord(producerId, id); // garantit l'appartenance
  await prisma.record.delete({ where: { id } });
}
