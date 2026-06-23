import { prisma } from "../../config/prisma.js";
import { notFound, badRequest } from "../../utils/AppError.js";

// Crée une demande de survol (statut initial : DEMANDE_ENVOYEE).
export async function createMission(producerId, input) {
  return prisma.droneMission.create({
    data: {
      producerId,
      pack: input.pack,
      parcelle: input.parcelle,
      culture: input.culture,
      hectares: input.hectares ?? null,
      zone: input.zone,
      scheduledFor: input.scheduledFor ?? null,
      note: input.note ?? null,
      status: "DEMANDE_ENVOYEE",
    },
  });
}

export async function listMissions(producerId) {
  return prisma.droneMission.findMany({
    where: { producerId },
    orderBy: { createdAt: "desc" },
    include: { report: true },
  });
}

export async function getMission(producerId, id) {
  const mission = await prisma.droneMission.findFirst({
    where: { id, producerId },
    include: { report: true },
  });
  if (!mission) throw notFound("Mission introuvable");
  return mission;
}

// Met à jour le statut d'une mission (planification, réalisation...).
export async function updateStatus(producerId, id, status) {
  await getMission(producerId, id);
  return prisma.droneMission.update({ where: { id }, data: { status } });
}

// Génère un rapport agronomique pour une mission réalisée.
// Les indices NDVI/santé sont ici simulés de façon déterministe ; en
// production ils proviendraient du traitement des images du drone.
export async function generateReport(producerId, missionId) {
  const mission = await getMission(producerId, missionId);
  if (mission.report) throw badRequest("Un rapport existe déjà pour cette mission");

  const { ndvi, healthScore, waterStress } = simulateIndices(mission);
  const { observation, recommendation } = buildNarrative(healthScore, waterStress);

  const report = await prisma.$transaction(async (tx) => {
    const created = await tx.droneReport.create({
      data: {
        missionId,
        ndvi,
        healthScore,
        waterStress,
        observation,
        recommendation,
      },
    });
    await tx.droneMission.update({
      where: { id: missionId },
      data: { status: "RAPPORT_PRET" },
    });

    // Un stress hydrique élevé déclenche une alerte climatique.
    if (waterStress === "Élevé") {
      await tx.alert.create({
        data: {
          producerId,
          priority: "URGENT",
          kind: "CLIMAT",
          title: "Stress hydrique détecté par drone",
          description: `Parcelle « ${mission.parcelle} » : zones de stress identifiées. Vérifiez l'irrigation/drainage.`,
        },
      });
    }
    return created;
  });

  return { ...mission, status: "RAPPORT_PRET", report };
}

// --- Helpers de simulation (déterministes pour des résultats stables) ---
function simulateIndices(mission) {
  // Graine simple à partir de l'id pour des valeurs reproductibles.
  const seed = [...mission.id].reduce((s, c) => s + c.charCodeAt(0), 0);
  const ndvi = +(0.45 + ((seed % 40) / 100)).toFixed(2); // 0.45..0.85
  const healthScore = Math.round(ndvi * 100 - 5);
  const waterStress = healthScore >= 75 ? "Faible" : healthScore >= 62 ? "Modéré" : "Élevé";
  return { ndvi, healthScore, waterStress };
}

function buildNarrative(health, stress) {
  if (health >= 75) {
    return {
      observation:
        "Couvert végétal homogène et vigoureux sur l'ensemble de la parcelle. Aucune anomalie majeure détectée.",
      recommendation:
        "Parcelle saine — poursuivre l'itinéraire technique actuel et reprogrammer un survol dans 3 semaines.",
    };
  }
  if (health >= 62) {
    return {
      observation:
        "Couvert globalement satisfaisant avec quelques zones de vigueur réduite en bordure.",
      recommendation:
        "Surveiller les zones moins vigoureuses ; vérifier la fertilisation et l'uniformité de l'irrigation.",
    };
  }
  return {
    observation:
      `Plusieurs zones de stress détectées (stress hydrique ${stress}). Hétérogénéité marquée du couvert.`,
    recommendation:
      "Inspecter rapidement les zones de stress, contrôler l'irrigation/drainage et envisager un apport ciblé d'intrants.",
  };
}
