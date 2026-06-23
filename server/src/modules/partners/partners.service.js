import { prisma } from "../../config/prisma.js";
import { notFound } from "../../utils/AppError.js";
import { computeScore } from "../score/score.service.js";

// Vue d'ensemble du réseau : liste des producteurs avec score courant,
// destinée aux partenaires (banques, ONG, coopératives). Lecture seule.
export async function listProducers({ zone, search } = {}) {
  const producers = await prisma.producer.findMany({
    where: {
      ...(zone ? { zone } : {}),
      ...(search
        ? { user: { fullName: { contains: search, mode: "insensitive" } } }
        : {}),
    },
    include: { user: { select: { fullName: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Score calculé à la volée pour chaque producteur (volet selon farmType).
  const enriched = await Promise.all(
    producers.map(async (p) => {
      const farmType = p.farmType === "AGRICOLE" ? "AGRICOLE" : "AVICOLE";
      const { global } = await computeScore(p.id, farmType);
      return {
        id: p.id,
        fullName: p.user.fullName,
        zone: p.zone,
        farmType: p.farmType,
        poultryCount: p.poultryCount,
        hectares: p.hectares,
        score: global,
        eligible: global >= 70,
        statut: global >= 70 ? "Éligible" : "À suivre",
      };
    })
  );

  return enriched;
}

export async function getNetworkSummary() {
  const producers = await listProducers();
  const total = producers.length;
  const eligible = producers.filter((p) => p.eligible).length;
  const avgScore =
    total === 0
      ? 0
      : Math.round(producers.reduce((s, p) => s + p.score, 0) / total);

  return {
    total,
    eligible,
    toMonitor: total - eligible,
    avgScore,
    // Producteurs prêts pour une offre de financement (score élevé).
    financingReady: producers.filter((p) => p.score >= 84).length,
  };
}

export async function getProducerDetail(producerId) {
  const producer = await prisma.producer.findUnique({
    where: { id: producerId },
    include: {
      user: { select: { fullName: true, email: true, phone: true } },
      scores: { orderBy: { createdAt: "desc" }, take: 6 },
    },
  });
  if (!producer) throw notFound("Producteur introuvable");

  const farmType = producer.farmType === "AGRICOLE" ? "AGRICOLE" : "AVICOLE";
  const score = await computeScore(producer.id, farmType);

  return {
    id: producer.id,
    fullName: producer.user.fullName,
    contact: { email: producer.user.email, phone: producer.user.phone },
    zone: producer.zone,
    farmType: producer.farmType,
    poultryCount: producer.poultryCount,
    hectares: producer.hectares,
    score,
    history: producer.scores,
  };
}
