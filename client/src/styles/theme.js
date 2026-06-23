// Palette verte sur fond blanc + helpers partagés par les pages.
export const C = {
  soil: "#14361F", ochre: "#1F8A4C", terra: "#C2451F",
  leaf: "#3FA968", leafDk: "#1B6E3C", ochreDk: "#157A40",
  millet: "#DCEFE2", sand: "#FFFFFF", line: "#DCE7DE",
};

export const card = {
  background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16,
  boxShadow: "0 1px 2px rgba(36,28,20,.04)",
};

export const prioStyle = {
  urgent: { bg: "#FBE7E1", fg: C.terra, label: "Urgent" },
  normal: { bg: "#F0E6D1", fg: C.ochreDk, label: "Normal" },
  info: { bg: "#E7EDE0", fg: C.leafDk, label: "Info" },
};

export const lblS = { display: "block", fontSize: 12, fontWeight: 600, color: "#3A6B4D", marginBottom: 6, marginTop: 4 };
export const inpS = { width: "100%", padding: "11px 13px", borderRadius: 11, border: `1.5px solid ${C.line}`, fontSize: 14, marginBottom: 13, outline: "none", fontFamily: "inherit", color: C.soil, boxSizing: "border-box", background: "#F6FBF8" };

export const barColor = (v) => (v >= 80 ? C.leaf : v >= 70 ? C.ochre : C.terra);
export const fmtDate = (s) => new Date(s).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });

// Libellés FR pour les enums renvoyées par l'API.
export const ZONE_LABELS = {
  CONAKRY: "Conakry", KINDIA: "Kindia", BOKE: "Boké", MAMOU: "Mamou",
  LABE: "Labé", FARANAH: "Faranah", KANKAN: "Kankan", NZEREKORE: "Nzérékoré",
};
export const ZONES = Object.keys(ZONE_LABELS);

export const RECORD_TYPE_LABELS = {
  ALIMENTATION: "Alimentation", VACCINATION: "Vaccination",
  TRAITEMENT: "Traitement", RENDEMENT: "Rendement",
};

export const PRIORITY_FROM_API = { URGENT: "urgent", NORMAL: "normal", INFO: "info" };
export const KIND_FROM_API = { VACCIN: "vaccin", CLIMAT: "climat", TRAITEMENT: "traitement" };

export const DRONE_STATUS_LABELS = {
  DEMANDE_ENVOYEE: "Demande envoyée", PLANIFIE: "Planifié",
  REALISE: "Réalisé", RAPPORT_PRET: "Rapport prêt", ANNULE: "Annulé",
};
