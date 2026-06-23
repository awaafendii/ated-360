import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Réinitialisation des données de démonstration...");

  // Nettoyage (ordre = respect des contraintes de clés étrangères).
  await prisma.droneReport.deleteMany();
  await prisma.droneMission.deleteMany();
  await prisma.scoreSnapshot.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.record.deleteMany();
  await prisma.producer.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123", 12);

  // --- Producteur de démonstration ---
  const mariama = await prisma.user.create({
    data: {
      fullName: "Mariama Baldé",
      email: "mariama@ferme.gn",
      phone: "+224620000001",
      passwordHash,
      role: "PRODUCTEUR",
      producer: {
        create: { zone: "LABE", farmType: "MIXTE", poultryCount: 1240, hectares: 6 },
      },
    },
    include: { producer: true },
  });
  const pid = mariama.producer.id;

  // --- Partenaire de démonstration ---
  await prisma.user.create({
    data: {
      fullName: "Crédit Rural de Guinée",
      email: "partenaire@credit.gn",
      phone: "+224620000099",
      passwordHash,
      role: "PARTENAIRE",
    },
  });

  // Autres producteurs (pour la vue partenaire).
  const others = [
    { name: "Ousmane Camara", email: "ousmane@ferme.gn", zone: "KANKAN", farmType: "AGRICOLE", poultry: 0, ha: 4 },
    { name: "Fatoumata Sylla", email: "fatoumata@ferme.gn", zone: "KINDIA", farmType: "MIXTE", poultry: 620, ha: 2 },
    { name: "Sékou Condé", email: "sekou@ferme.gn", zone: "FARANAH", farmType: "AGRICOLE", poultry: 0, ha: 3 },
    { name: "Aïssata Diallo", email: "aissata@ferme.gn", zone: "BOKE", farmType: "AVICOLE", poultry: 200, ha: 0 },
  ];
  for (const o of others) {
    await prisma.user.create({
      data: {
        fullName: o.name,
        email: o.email,
        passwordHash,
        role: "PRODUCTEUR",
        producer: { create: { zone: o.zone, farmType: o.farmType, poultryCount: o.poultry, hectares: o.ha } },
      },
    });
  }

  // --- Registre : quelques activités pour Mariama ---
  const day = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
  await prisma.record.createMany({
    data: [
      { producerId: pid, type: "ALIMENTATION", farmType: "AVICOLE", detail: "Provende ponte — 45 kg", quantity: "45 kg", zone: "LABE", occurredAt: day(1) },
      { producerId: pid, type: "VACCINATION", farmType: "AVICOLE", detail: "Newcastle — lot B2", quantity: "320 sujets", zone: "LABE", occurredAt: day(2), details: { espece: "Pondeuse", effectif: 320, vaccin: "Newcastle" } },
      { producerId: pid, type: "RENDEMENT", farmType: "AVICOLE", detail: "Collecte œufs", quantity: "284 œufs", zone: "LABE", occurredAt: day(3) },
      { producerId: pid, type: "RENDEMENT", farmType: "AGRICOLE", detail: "Récolte riz — bas-fond", quantity: "1,4 t", zone: "LABE", occurredAt: day(5), details: { culture: "Riz", surfaceHa: 2.4, rendementTHa: 3.1 } },
      { producerId: pid, type: "TRAITEMENT", farmType: "AGRICOLE", detail: "Désherbage manioc parcelle 2", quantity: "0,5 ha", zone: "LABE", occurredAt: day(7) },
    ],
  });

  // --- Alertes ---
  await prisma.alert.createMany({
    data: [
      { producerId: pid, priority: "URGENT", kind: "VACCIN", title: "Rappel vaccinal Gumboro", description: "Lot B2 (320 poussins) — fenêtre J18 à respecter.", dueAt: day(-1) },
      { producerId: pid, priority: "URGENT", kind: "CLIMAT", title: "Fortes pluies attendues", description: "Saison des pluies : vérifier drainage et étanchéité du poulailler.", dueAt: day(-2) },
      { producerId: pid, priority: "NORMAL", kind: "TRAITEMENT", title: "Déparasitage programmé", description: "Traitement antiparasitaire trimestriel du cheptel.", dueAt: day(-4) },
      { producerId: pid, priority: "INFO", kind: "CLIMAT", title: "Calendrier cultural", description: "Conditions favorables au semis du maïs en Haute-Guinée." },
    ],
  });

  // --- Missions drone + un rapport prêt ---
  const mission1 = await prisma.droneMission.create({
    data: { producerId: pid, pack: "SANTE", parcelle: "Bas-fond riz — Labé", culture: "Riz", hectares: 2.4, zone: "LABE", status: "RAPPORT_PRET", scheduledFor: day(8) },
  });
  await prisma.droneReport.create({
    data: {
      missionId: mission1.id, ndvi: 0.71, healthScore: 78, waterStress: "Faible",
      observation: "Végétation vigoureuse au centre, léger jaunissement en bordure est (drainage à surveiller).",
      recommendation: "Parcelle saine — poursuivre l'itinéraire technique et reprogrammer un survol dans 3 semaines.",
    },
  });
  await prisma.droneMission.create({
    data: { producerId: pid, pack: "COMPLET", parcelle: "Champ manioc — Faranah", culture: "Manioc", hectares: 3, zone: "FARANAH", status: "PLANIFIE", scheduledFor: day(-3) },
  });

  console.log("✅ Données de démonstration créées.");
  console.log("\n   Comptes de test (mot de passe : Password123)");
  console.log("   • Producteur : mariama@ferme.gn");
  console.log("   • Partenaire : partenaire@credit.gn\n");
}

main()
  .catch((e) => {
    console.error("❌ Échec du seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
