import nodemailer from "nodemailer";
import { prisma } from "../../config/prisma.js";
import { notFound } from "../../utils/AppError.js";
import { computeScore } from "../score/score.service.js";

const OFFER_RECIPIENT = "brahamcamara6@gmail.com";

function createTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

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
    financingReady: producers.filter((p) => p.score >= 84).length,
  };
}

export async function getProducerDetail(producerId) {
  const producer = await prisma.producer.findUnique({
    where: { id: producerId },
    include: {
      user: { select: { fullName: true, email: true, phone: true } },
      scores: { orderBy: { createdAt: "desc" }, take: 6 },
      records: { orderBy: { occurredAt: "desc" }, take: 20 },
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
    records: producer.records,
  };
}

export async function sendOffer({ producerId, partnerName, message, amount, phone, email }) {
  const producer = await prisma.producer.findUnique({
    where: { id: producerId },
    include: { user: { select: { fullName: true } } },
  });
  if (!producer) throw notFound("Producteur introuvable");

  const html = `
    <h2>Nouvelle offre partenaire — ATED-360</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;">
      <tr><td style="padding:6px 12px;font-weight:bold;">Partenaire</td><td style="padding:6px 12px;">${partnerName}</td></tr>
      ${email ? `<tr><td style="padding:6px 12px;font-weight:bold;">E-mail partenaire</td><td style="padding:6px 12px;">${email}</td></tr>` : ""}
      ${phone ? `<tr><td style="padding:6px 12px;font-weight:bold;">Téléphone</td><td style="padding:6px 12px;">${phone}</td></tr>` : ""}
      <tr><td style="padding:6px 12px;font-weight:bold;">Producteur visé</td><td style="padding:6px 12px;">${producer.user.fullName}</td></tr>
      <tr><td style="padding:6px 12px;font-weight:bold;">Zone</td><td style="padding:6px 12px;">${producer.zone}</td></tr>
      ${amount ? `<tr><td style="padding:6px 12px;font-weight:bold;">Montant proposé</td><td style="padding:6px 12px;">${amount}</td></tr>` : ""}
      <tr><td style="padding:6px 12px;font-weight:bold;">Message</td><td style="padding:6px 12px;">${message}</td></tr>
    </table>
  `;

  const transporter = createTransporter();
  if (!transporter) {
    console.warn("⚠️ SMTP non configuré — offre enregistrée mais email non envoyé.");
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: OFFER_RECIPIENT,
      subject: `[ATED-360] Offre de ${partnerName} pour ${producer.user.fullName}`,
      html,
    });
  } catch (err) {
    console.error("❌ Erreur envoi email :", err.message);
    throw new Error("L'offre n'a pas pu être envoyée par email. Vérifiez la configuration SMTP.");
  }
}
