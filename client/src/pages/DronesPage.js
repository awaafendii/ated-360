import React, { useEffect, useState, useCallback } from "react";
import { Plane, Camera, FileText, Clock, Ruler, MapPin, CheckCircle2, X, Download, Layers, Activity, Info } from "lucide-react";
import { dronesApi } from "../api/index.js";
import { C, card, lblS, inpS, fmtDate, ZONES, ZONE_LABELS, DRONE_STATUS_LABELS } from "../styles/theme.js";
import { Page, Row, H, Tag, Spinner, ErrorBanner } from "../components/ui.js";
import { CULTURES_WITH_AUTRE, AUTRE_CULTURE } from "../data/cultures.js";

const PACKS = [
  { id: "SURVOL", nom: "Survol simple", desc: "Cartographie RGB + aperçu visuel.", duree: "≈ 30 min", prix: "150 000 GNF" },
  { id: "SANTE", nom: "Diagnostic santé (NDVI)", desc: "Indice de végétation, zones de stress, rapport.", duree: "≈ 1 h", prix: "320 000 GNF", reco: true },
  { id: "COMPLET", nom: "Audit complet", desc: "NDVI + thermique + comptage de pieds.", duree: "≈ 2 h", prix: "600 000 GNF" },
];
const healthColor = (v) => (v >= 75 ? C.leaf : v >= 62 ? C.ochre : C.terra);

export default function DronesPage() {
  const [pack, setPack] = useState("SANTE");
  const [form, setForm] = useState({ parcelle: "", culture: "Riz", cultureAutre: "", hectares: "", zone: "CONAKRY", scheduledFor: "" });
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [open, setOpen] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setMissions(await dronesApi.listMissions()); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!form.parcelle.trim()) return;
    setBusy(true); setError("");
    try {
      const cultureFinale = form.culture === AUTRE_CULTURE ? (form.cultureAutre || AUTRE_CULTURE) : form.culture;
      await dronesApi.createMission({
        pack, parcelle: form.parcelle, culture: cultureFinale,
        hectares: form.hectares || undefined, zone: form.zone,
        scheduledFor: form.scheduledFor || undefined,
      });
      setForm({ ...form, parcelle: "", hectares: "", scheduledFor: "" });
      setConfirm(true); setTimeout(() => setConfirm(false), 3200);
      await load();
    } catch (e) { setError(e.details?.map((d) => d.message).join(" · ") || e.message); }
    finally { setBusy(false); }
  };

  const genReport = async (id) => {
    setError("");
    try { const updated = await dronesApi.generateReport(id); setOpen(updated.report ? updated : null); await load(); }
    catch (e) { setError(e.message); }
  };

  return (
    <Page title="Drones & état des champs" subtitle="Réservez un survol, suivez l'état de vos parcelles et générez des rapports.">
      <ErrorBanner message={error} />

      <button onClick={() => setShowInfo((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: "none", cursor: "pointer", color: C.leafDk, fontSize: 12.5, fontWeight: 700, padding: 0, marginBottom: showInfo ? 10 : 16 }}>
        <Info size={14} /> {showInfo ? "Masquer" : "Comment fonctionne le service drone ?"}
      </button>
      {showInfo && (
        <div style={{ ...card, padding: "16px 18px", marginBottom: 16, background: "#FAFDFB" }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.soil, marginBottom: 10 }}>Déroulé d'une demande de survol</div>
          <div className="grid4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
            {[
              ["1. Demande", "Vous choisissez une formule et envoyez la demande de survol pour une parcelle."],
              ["2. Réception", "L'équipe ATED‑360 reçoit la demande et planifie un créneau avec un pilote."],
              ["3. Survol", "Le drone survole la parcelle à la date convenue et capture les images."],
              ["4. Rapport", "Les images sont traitées et le rapport (carte, indices, recommandations) est mis à votre disposition ici."],
            ].map(([t, d]) => (
              <div key={t} style={{ padding: 12, borderRadius: 11, border: `1px solid ${C.line}`, background: "#fff" }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: C.leafDk, marginBottom: 4 }}>{t}</div>
                <div style={{ fontSize: 11.5, color: "#3A6B4D", lineHeight: 1.4 }}>{d}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "#3A6B4D", lineHeight: 1.6 }}>
            <strong style={{ color: C.soil }}>Prérequis :</strong> parcelle accessible et dégagée, dimensions et localisation renseignées, coordonnées à jour pour être contacté par le pilote.<br />
            <strong style={{ color: C.soil }}>Délais :</strong> confirmation du créneau sous 48 h ouvrées, rapport disponible peu après le survol selon la formule choisie.<br />
            <strong style={{ color: C.soil }}>Données produites :</strong> carte NDVI (santé de la végétation), indice de santé /100, niveau de stress hydrique, constat agronomique et recommandation, exportables en PDF.
          </div>
        </div>
      )}

      {confirm && (
        <div style={{ ...card, padding: "13px 16px", marginBottom: 16, background: C.millet, border: `1px solid ${C.leaf}`, display: "flex", gap: 10, alignItems: "center" }}>
          <CheckCircle2 size={19} color={C.leafDk} /><span style={{ fontSize: 13.5, color: C.soil, fontWeight: 600 }}>Demande de survol envoyée — un pilote vous contactera pour confirmer.</span>
        </div>
      )}

      <div className="dash-2col" style={{ display: "grid", gridTemplateColumns: ".95fr 1.05fr", gap: 18 }}>
        <div style={{ ...card, padding: 20, alignSelf: "start" }}>
          <Row><H>Réserver un drone</H><Plane size={20} color={C.ochre} /></Row>
          <label style={{ ...lblS, marginTop: 14 }}>Formule de survol</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 16 }}>
            {PACKS.map((p) => {
              const on = pack === p.id;
              return (
                <button key={p.id} onClick={() => setPack(p.id)} style={{ textAlign: "left", padding: 14, borderRadius: 12, cursor: "pointer", border: `1.5px solid ${on ? C.ochre : C.line}`, background: on ? C.ochre + "10" : "#fff", position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: C.soil }}>{p.nom}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: C.ochreDk }}>{p.prix}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#3A6B4D", marginTop: 4 }}>{p.desc}</div>
                  <div style={{ fontSize: 11.5, color: "#6E9180", marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}><Clock size={12} /> {p.duree}</div>
                  {p.reco && <span style={{ position: "absolute", top: -9, right: 12, background: C.leaf, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase" }}>Recommandé</span>}
                </button>
              );
            })}
          </div>
          <label style={lblS}>Nom de la parcelle</label>
          <input value={form.parcelle} onChange={(e) => setForm({ ...form, parcelle: e.target.value })} placeholder="Ex. Bas-fond riz nord" style={inpS} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><label style={lblS}>Culture</label><select value={form.culture} onChange={(e) => setForm({ ...form, culture: e.target.value })} style={inpS}>{CULTURES_WITH_AUTRE.map((x) => <option key={x}>{x}</option>)}</select></div>
            <div><label style={lblS}><Ruler size={11} /> Surface (ha)</label><input value={form.hectares} onChange={(e) => setForm({ ...form, hectares: e.target.value })} placeholder="2.5" style={inpS} /></div>
          </div>
          {form.culture === AUTRE_CULTURE && (
            <div><label style={lblS}>Précisez la culture</label>
              <input value={form.cultureAutre} onChange={(e) => setForm({ ...form, cultureAutre: e.target.value })} placeholder="Ex. Baobab, Néré…" style={inpS} /></div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><label style={lblS}><MapPin size={11} /> Zone</label><select value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} style={inpS}>{ZONES.map((z) => <option key={z} value={z}>{ZONE_LABELS[z]}</option>)}</select></div>
            <div><label style={lblS}>Date souhaitée</label><input type="date" value={form.scheduledFor} onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })} style={inpS} /></div>
          </div>
          <button onClick={submit} disabled={busy} style={{ width: "100%", padding: "12px 0", border: "none", borderRadius: 11, background: busy ? "#9CC4AC" : C.ochre, color: "#fff", fontWeight: 700, fontSize: 14, cursor: busy ? "default" : "pointer", display: "flex", justifyContent: "center", gap: 8, alignItems: "center", marginTop: 4 }}>
            <Plane size={17} /> {busy ? "Envoi…" : "Envoyer la demande de survol"}
          </button>
        </div>

        <div style={{ ...card, padding: 20 }}>
          <Row><H>Mes parcelles survolées</H><Tag bg={C.leaf + "1A"} fg={C.leafDk}>{missions.length} mission{missions.length > 1 ? "s" : ""}</Tag></Row>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            {loading ? <Spinner /> : missions.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "#6E9180", fontSize: 13.5 }}>Aucune mission. Réservez un survol à gauche.</div>
            ) : missions.map((m) => {
              const ready = !!m.report;
              return (
                <div key={m.id} style={{ border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ display: "flex", gap: 13, padding: 14, alignItems: "center" }}>
                    <span style={{ width: 44, height: 44, borderRadius: 11, background: C.millet, display: "grid", placeItems: "center", flexShrink: 0 }}><Camera size={20} color={C.leafDk} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: C.soil }}>{m.parcelle}</div>
                      <div style={{ fontSize: 11.5, color: "#6E9180" }}>{m.culture}{m.hectares ? ` · ${m.hectares} ha` : ""} · {ZONE_LABELS[m.zone]}</div>
                    </div>
                    <Tag bg={ready ? C.leaf + "1A" : C.ochre + "1A"} fg={ready ? C.leafDk : C.ochreDk}>{DRONE_STATUS_LABELS[m.status]}</Tag>
                  </div>
                  <div style={{ borderTop: `1px solid ${C.line}`, padding: "11px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "#FAFDFB" }}>
                    {ready ? (
                      <>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <span style={{ fontSize: 12, color: "#6E9180" }}>Santé <strong style={{ color: healthColor(m.report.healthScore), fontSize: 14 }}>{m.report.healthScore}</strong>/100</span>
                          <span style={{ fontSize: 12, color: "#6E9180" }}>Stress : <strong style={{ color: C.soil }}>{m.report.waterStress}</strong></span>
                        </div>
                        <button onClick={() => setOpen(m)} style={btnDark}><FileText size={14} /> Voir le rapport</button>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: 12, color: "#6E9180" }}>Mission planifiée — rapport non généré</span>
                        <button onClick={() => genReport(m.id)} style={btnDark}><Activity size={14} /> Générer le rapport</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {open && open.report && <ReportModal mission={open} onClose={() => setOpen(null)} />}
    </Page>
  );
}

const btnDark = { display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 9, border: "none", background: C.soil, color: "#fff", fontSize: 12.5, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" };

function ReportModal({ mission, onClose }) {
  const r = mission.report;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,54,31,.45)", zIndex: 60, display: "grid", placeItems: "center", padding: 18 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...card, maxWidth: 540, width: "100%", maxHeight: "88vh", overflowY: "auto", padding: 0 }}>
        <div style={{ background: C.soil, color: "#fff", padding: "20px 24px", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#9CC4AC", fontWeight: 600 }}><FileText size={14} /> RAPPORT DRONE ATED‑360</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, marginTop: 6 }}>{mission.parcelle}</div>
            <div style={{ fontSize: 12.5, color: "#BFE0CC", marginTop: 3 }}>{mission.culture} · {ZONE_LABELS[mission.zone]} · {fmtDate(r.createdAt)}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.12)", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", padding: 6 }}><X size={18} /></button>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ height: 150, borderRadius: 12, overflow: "hidden", marginBottom: 18, position: "relative", background: `linear-gradient(135deg, ${C.leaf} 0%, ${C.ochre} 55%, ${C.terra} 100%)` }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 40%, rgba(255,255,255,.35), transparent 40%), radial-gradient(circle at 75% 70%, rgba(0,0,0,.2), transparent 35%)" }} />
            <div style={{ position: "absolute", left: 12, bottom: 10, background: "rgba(20,54,31,.7)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 9px", borderRadius: 6, display: "flex", alignItems: "center", gap: 5 }}><Layers size={12} /> Carte NDVI — vert = sain · rouge = stress</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
            <Kpi label="Indice santé" value={r.healthScore} suffix="/100" col={healthColor(r.healthScore)} />
            <Kpi label="NDVI moyen" value={r.ndvi.toFixed(2)} col={C.leafDk} />
            <Kpi label="Stress hydrique" value={r.waterStress} small col={r.waterStress === "Faible" ? C.leaf : r.waterStress === "Modéré" ? C.ochre : C.terra} />
          </div>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.soil, marginBottom: 6 }}>Constat agronomique</div>
          <p style={{ fontSize: 13.5, color: "#3A6B4D", lineHeight: 1.6, margin: 0 }}>{r.observation}</p>
          <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: C.millet, display: "flex", gap: 11 }}>
            <Activity size={18} color={C.leafDk} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12.5, color: "#2D5A3E", lineHeight: 1.5 }}><strong style={{ color: C.soil }}>Recommandation :</strong> {r.recommendation}</div>
          </div>
          <button onClick={() => window.print()} style={{ width: "100%", marginTop: 18, padding: "12px 0", border: "none", borderRadius: 11, background: C.ochre, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", justifyContent: "center", gap: 8, alignItems: "center" }}>
            <Download size={17} /> Imprimer / Enregistrer en PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, suffix, col, small }) {
  return (
    <div style={{ border: `1px solid ${C.line}`, borderRadius: 11, padding: "11px 12px" }}>
      <div style={{ fontSize: 10.5, color: "#6E9180", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".03em" }}>{label}</div>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: small ? 16 : 24, fontWeight: 600, color: col, marginTop: 4, lineHeight: 1 }}>{value}<span style={{ fontSize: 12, color: "#9CC4AC" }}>{suffix}</span></div>
    </div>
  );
}
