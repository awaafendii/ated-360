import { prisma } from "../../config/prisma.js";
import { notFound } from "../../utils/AppError.js";

// ============================================================
// Moteur de Score Producteur ATED-360
// ------------------------------------------------------------
// Le score combine des critères communs (régularité des saisies,
// santé financière) et des critères propres à la filière évaluée
// (avicole OU agricole). Chaque critère est noté sur 100 ; le
// score global est la moyenne. Les valeurs s'appuient sur les
// données réelles de la ferme quand elles existent, avec un
// repli raisonnable sinon.
// ============================================================

const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(n)));

// --- Critère commun : régularité des enregistrements (30 derniers jours) ---
async function regularityScore(producerId) {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const records = await prisma.record.findMany({
    where: { producerId, occurredAt: { gte: since } },
    select: { occurredAt: true },
  });

  // Nombre de jours distincts avec au moins une saisie sur 30.
  const distinctDays = new Set(
    records.map((r) => r.occurredAt.toISOString().slice(0, 10))
  ).size;

  // 25 jours actifs / 30 = score plein.
  return clamp((distinctDays / 25) * 100);
}

// --- Critère commun : santé financière (proxy basé sur les rendements saisis) ---
async function financialScore(producerId) {
  const since = new Date();
  since.setDate(since.getDate() - 90);
  const yields = await prisma.record.count({
    where: { producerId, type: "RENDEMENT", occurredAt: { gte: since } },
  });
  // Plus de récoltes/collectes documentées => meilleure visibilité financière.
  return clamp(55 + yields * 4);
}

// --- Critère avicole : couverture vaccinale ---
async function vaccinationScore(producerId) {
  const since = new Date();
  since.setDate(since.getDate() - 120);
  const vaccines = await prisma.record.count({
    where: { producerId, type: "VACCINATION", occurredAt: { gte: since } },
  });
  return clamp(50 + vaccines * 12);
}

// --- Critère avicole : biosécurité (proxy : traitements préventifs réguliers) ---
async function biosecurityScore(producerId) {
  const since = new Date();
  since.setDate(since.getDate() - 90);
  const treatments = await prisma.record.count({
    where: { producerId, type: "TRAITEMENT", farmType: "AVICOLE", occurredAt: { gte: since } },
  });
  return clamp(60 + treatments * 8);
}

// --- Critère agricole : santé du champ / sol (proxy : traitements & intrants) ---
async function fieldHealthScore(producerId) {
  const since = new Date();
  since.setDate(since.getDate() - 120);
  const ops = await prisma.record.count({
    where: { producerId, farmType: "AGRICOLE", occurredAt: { gte: since } },
  });
  return clamp(58 + ops * 6);
}

// --- Bonus drone : un diagnostic santé récent fiabilise l'évaluation agricole ---
async function droneHealthAverage(producerId) {
  const reports = await prisma.droneReport.findMany({
    where: { mission: { producerId } },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { healthScore: true },
  });
  if (reports.length === 0) return null;
  const avg = reports.reduce((s, r) => s + r.healthScore, 0) / reports.length;
  return clamp(avg);
}

/**
 * Calcule le score pour un volet donné ("AVICOLE" | "AGRICOLE").
 * Retourne { global, breakdown } où breakdown détaille chaque critère.
 */
export async function computeScore(producerId, farmType = "AVICOLE") {
  const producer = await prisma.producer.findUnique({ where: { id: producerId } });
  if (!producer) throw notFound("Producteur introuvable");

  const [regularity, financial] = await Promise.all([
    regularityScore(producerId),
    financialScore(producerId),
  ]);

  let breakdown = {
    "Régularité des enregistrements": regularity,
    "Santé financière": financial,
  };

  if (farmType === "AVICOLE") {
    const [vaccination, biosecurity] = await Promise.all([
      vaccinationScore(producerId),
      biosecurityScore(producerId),
    ]);
    breakdown = {
      "Biosécurité de la ferme": biosecurity,
      "Vaccination des volailles": vaccination,
      "Hygiène & climat du poulailler": clamp((biosecurity + 70) / 2),
      "Rendement (ponte / chair)": clamp((financial + 80) / 2),
      ...breakdown,
    };
  } else {
    const [fieldHealth, droneAvg] = await Promise.all([
      fieldHealthScore(producerId),
      droneHealthAverage(producerId),
    ]);
    breakdown = {
      "Santé du champ": droneAvg != null ? clamp((fieldHealth + droneAvg) / 2) : fieldHealth,
      "Fertilité du sol": clamp(fieldHealth - 6),
      "Gestion de l'eau & climat": droneAvg != null ? droneAvg : clamp(fieldHealth + 3),
      "Rendement à l'hectare": clamp((financial + 78) / 2),
      ...breakdown,
    };
  }

  const values = Object.values(breakdown);
  const global = clamp(values.reduce((s, v) => s + v, 0) / values.length);

  return { global, breakdown, farmType };
}

/**
 * Calcule puis enregistre un instantané de score (traçabilité partenaires).
 */
export async function computeAndSnapshot(producerId, farmType = "AVICOLE") {
  const result = await computeScore(producerId, farmType);
  await prisma.scoreSnapshot.create({
    data: {
      producerId,
      global: result.global,
      breakdown: result.breakdown,
      farmType: result.farmType,
    },
  });
  return result;
}

export async function getScoreHistory(producerId, limit = 12) {
  return prisma.scoreSnapshot.findMany({
    where: { producerId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
