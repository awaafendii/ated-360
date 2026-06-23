// Enveloppe de réponse uniforme pour toute l'API.
export const ok = (res, data, meta) =>
  res.json({ success: true, data, ...(meta ? { meta } : {}) });

export const created = (res, data) =>
  res.status(201).json({ success: true, data });

// --- Dictionnaires de libellés (pour aligner l'API sur le frontend FR) ---

export const ZONE_LABELS = {
  CONAKRY: "Conakry", KINDIA: "Kindia", BOKE: "Boké", MAMOU: "Mamou",
  LABE: "Labé", FARANAH: "Faranah", KANKAN: "Kankan", NZEREKORE: "Nzérékoré",
};

export const RECORD_TYPE_LABELS = {
  ALIMENTATION: "Alimentation", VACCINATION: "Vaccination",
  TRAITEMENT: "Traitement", RENDEMENT: "Rendement",
};

export const PRIORITY_LABELS = { URGENT: "urgent", NORMAL: "normal", INFO: "info" };
export const KIND_LABELS = { VACCIN: "vaccin", CLIMAT: "climat", TRAITEMENT: "traitement" };

export const DRONE_STATUS_LABELS = {
  DEMANDE_ENVOYEE: "Demande envoyée", PLANIFIE: "Planifié",
  REALISE: "Réalisé", RAPPORT_PRET: "Rapport prêt", ANNULE: "Annulé",
};

export const DRONE_PACK_LABELS = {
  SURVOL: "Survol simple", SANTE: "Diagnostic santé (NDVI)", COMPLET: "Audit complet",
};
