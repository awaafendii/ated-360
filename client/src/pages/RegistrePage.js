import React, { useEffect, useState, useCallback } from "react";
import { Wheat, Syringe, Pill, TrendingUp, Bird, Sprout, Plus, Ruler, FlaskConical, MapPin } from "lucide-react";
import { recordsApi } from "../api/index.js";
import { C, card, lblS, inpS, fmtDate, ZONES, ZONE_LABELS, RECORD_TYPE_LABELS } from "../styles/theme.js";
import { Page, Row, H, Spinner, ErrorBanner } from "../components/ui.js";

const recIcon = (t) => ({ ALIMENTATION: Wheat, VACCINATION: Syringe, TRAITEMENT: Pill, RENDEMENT: TrendingUp }[t] || TrendingUp);
const TYPES = ["ALIMENTATION", "VACCINATION", "TRAITEMENT", "RENDEMENT"];

export default function RegistrePage() {
  const [cat, setCat] = useState("AVICOLE");
  const [filter, setFilter] = useState("Tous");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [base, setBase] = useState({ nom: "", zone: "CONAKRY", type: "ALIMENTATION", detail: "", qty: "" });
  const [avi, setAvi] = useState({ espece: "Pondeuse", effectif: "", age: "", vaccin: "", mortalite: "", ponte: "" });
  const [agri, setAgri] = useState({ culture: "Riz", surface: "", phase: "Croissance", sol: "Argilo-limoneux", intrant: "", rendement: "" });

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = filter !== "Tous" ? { type: filter, limit: 50 } : { limit: 50 };
      const { items } = await recordsApi.list(params);
      setItems(items);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!base.detail.trim()) return;
    setBusy(true); setError("");
    const details = cat === "AVICOLE"
      ? { espece: avi.espece, effectif: avi.effectif || undefined, ageSemaines: avi.age || undefined, mortalitePct: avi.mortalite || undefined, vaccin: avi.vaccin || undefined, ponteParJour: avi.ponte || undefined }
      : { culture: agri.culture, surfaceHa: agri.surface || undefined, phase: agri.phase, typeSol: agri.sol, intrant: agri.intrant || undefined, rendementTHa: agri.rendement || undefined };
    try {
      await recordsApi.create({ type: base.type, farmType: cat, detail: base.detail, quantity: base.qty || undefined, zone: base.zone, details });
      setBase({ ...base, detail: "", qty: "" });
      await load();
    } catch (e) {
      setError(e.details?.map((d) => d.message).join(" · ") || e.message);
    } finally { setBusy(false); }
  };

  return (
    <Page title="Registre digital" subtitle="Identité, zone d'exploitation et activité — l'historique nourrit votre score.">
      <ErrorBanner message={error} />
      <div className="dash-2col" style={{ display: "grid", gridTemplateColumns: ".95fr 1.05fr", gap: 18 }}>
        <div style={{ ...card, padding: 20, alignSelf: "start" }}>
          <H>Nouvelle saisie</H>
          <div style={{ marginTop: 16 }}>
            <label style={lblS}>Nom et prénoms</label>
            <input value={base.nom} onChange={(e) => setBase({ ...base, nom: e.target.value })} placeholder="Mariama Baldé" style={inpS} />
            <label style={lblS}><MapPin size={12} style={{ verticalAlign: "-2px" }} /> Zone d'exploitation</label>
            <select value={base.zone} onChange={(e) => setBase({ ...base, zone: e.target.value })} style={inpS}>
              {ZONES.map((z) => <option key={z} value={z}>{ZONE_LABELS[z]}</option>)}
            </select>
          </div>

          <label style={lblS}>Type de ferme</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[["AVICOLE", Bird, "Avicole"], ["AGRICOLE", Sprout, "Agricole"]].map(([c, Ic, lbl]) => {
              const on = cat === c;
              return <button key={c} onClick={() => setCat(c)} style={{ flex: 1, display: "flex", justifyContent: "center", gap: 7, alignItems: "center", padding: "10px 0", borderRadius: 10, cursor: "pointer", fontSize: 13.5, fontWeight: 700, border: `1.5px solid ${on ? C.leaf : C.line}`, background: on ? C.leaf + "14" : "#fff", color: on ? C.leafDk : "#3A6B4D" }}><Ic size={16} /> {lbl}</button>;
            })}
          </div>

          {cat === "AVICOLE" ? (
            <div style={fieldBox}>
              <SectionLabel icon={Bird}>Informations avicoles</SectionLabel>
              <F2>
                <div><label style={lblS}>Espèce</label><select value={avi.espece} onChange={(e) => setAvi({ ...avi, espece: e.target.value })} style={inpS}>{["Pondeuse", "Poulet de chair", "Pintade", "Coq local", "Canard"].map((x) => <option key={x}>{x}</option>)}</select></div>
                <div><label style={lblS}>Effectif</label><input value={avi.effectif} onChange={(e) => setAvi({ ...avi, effectif: e.target.value })} placeholder="320" style={inpS} /></div>
              </F2>
              <F2>
                <div><label style={lblS}>Âge (sem.)</label><input value={avi.age} onChange={(e) => setAvi({ ...avi, age: e.target.value })} placeholder="18" style={inpS} /></div>
                <div><label style={lblS}>Mortalité (%)</label><input value={avi.mortalite} onChange={(e) => setAvi({ ...avi, mortalite: e.target.value })} placeholder="2.5" style={inpS} /></div>
              </F2>
              <F2>
                <div><label style={lblS}>Vaccin</label><select value={avi.vaccin} onChange={(e) => setAvi({ ...avi, vaccin: e.target.value })} style={inpS}>{["", "Newcastle", "Gumboro", "Variole aviaire", "Bronchite infectieuse"].map((x) => <option key={x} value={x}>{x || "—"}</option>)}</select></div>
                <div><label style={lblS}>Ponte / jour</label><input value={avi.ponte} onChange={(e) => setAvi({ ...avi, ponte: e.target.value })} placeholder="284" style={inpS} /></div>
              </F2>
            </div>
          ) : (
            <div style={fieldBox}>
              <SectionLabel icon={Sprout}>Informations agricoles</SectionLabel>
              <F2>
                <div><label style={lblS}>Culture</label><select value={agri.culture} onChange={(e) => setAgri({ ...agri, culture: e.target.value })} style={inpS}>{["Riz", "Manioc", "Maïs", "Fonio", "Arachide", "Igname", "Café", "Ananas"].map((x) => <option key={x}>{x}</option>)}</select></div>
                <div><label style={lblS}><Ruler size={11} /> Surface (ha)</label><input value={agri.surface} onChange={(e) => setAgri({ ...agri, surface: e.target.value })} placeholder="2.5" style={inpS} /></div>
              </F2>
              <F2>
                <div><label style={lblS}>Phase</label><select value={agri.phase} onChange={(e) => setAgri({ ...agri, phase: e.target.value })} style={inpS}>{["Préparation sol", "Semis", "Croissance", "Floraison", "Récolte"].map((x) => <option key={x}>{x}</option>)}</select></div>
                <div><label style={lblS}>Type de sol</label><select value={agri.sol} onChange={(e) => setAgri({ ...agri, sol: e.target.value })} style={inpS}>{["Argilo-limoneux", "Sableux", "Latéritique", "Bas-fond (hydromorphe)"].map((x) => <option key={x}>{x}</option>)}</select></div>
              </F2>
              <F2>
                <div><label style={lblS}><FlaskConical size={11} /> Intrant</label><input value={agri.intrant} onChange={(e) => setAgri({ ...agri, intrant: e.target.value })} placeholder="Urée, NPK…" style={inpS} /></div>
                <div><label style={lblS}>Rendement (t/ha)</label><input value={agri.rendement} onChange={(e) => setAgri({ ...agri, rendement: e.target.value })} placeholder="3.1" style={inpS} /></div>
              </F2>
            </div>
          )}

          <label style={lblS}>Type d'activité</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 13 }}>
            {TYPES.map((t) => {
              const M = recIcon(t); const on = base.type === t;
              return <button key={t} onClick={() => setBase({ ...base, type: t })} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 11px", borderRadius: 10, cursor: "pointer", fontSize: 12.5, fontWeight: 600, border: `1.5px solid ${on ? C.ochre : C.line}`, background: on ? C.ochre + "12" : "#fff", color: on ? C.ochreDk : "#3A6B4D" }}><M size={15} /> {RECORD_TYPE_LABELS[t]}</button>;
            })}
          </div>
          <label style={lblS}>Description</label>
          <input value={base.detail} onChange={(e) => setBase({ ...base, detail: e.target.value })} placeholder={cat === "AVICOLE" ? "Ex. Vaccin Newcastle — lot B2" : "Ex. Repiquage riz bas-fond"} style={inpS} />
          <label style={lblS}>Quantité / lot (optionnel)</label>
          <input value={base.qty} onChange={(e) => setBase({ ...base, qty: e.target.value })} placeholder="320 sujets, 45 kg, 0.5 ha…" style={inpS} />

          <button onClick={submit} disabled={busy} style={{ width: "100%", padding: "12px 0", border: "none", borderRadius: 11, background: busy ? "#9CC4AC" : C.leaf, color: "#fff", fontWeight: 700, fontSize: 14, cursor: busy ? "default" : "pointer", display: "flex", justifyContent: "center", gap: 8, alignItems: "center", marginTop: 4 }}>
            <Plus size={17} /> {busy ? "Enregistrement…" : "Enregistrer l'activité"}
          </button>
        </div>

        <div style={{ ...card, padding: 20 }}>
          <Row>
            <H>Historique</H>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["Tous", ...TYPES].map((t) => (
                <button key={t} onClick={() => setFilter(t)} style={{ fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: 999, cursor: "pointer", border: "none", background: filter === t ? C.soil : C.millet, color: filter === t ? "#fff" : "#3A6B4D" }}>{t === "Tous" ? "Tous" : RECORD_TYPE_LABELS[t]}</button>
              ))}
            </div>
          </Row>
          <div style={{ marginTop: 12 }}>
            {loading ? <Spinner /> : items.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "#6E9180", fontSize: 13.5 }}>Aucune activité. Commencez par une saisie à gauche.</div>
            ) : items.map((r) => {
              const M = recIcon(r.type);
              const col = { ALIMENTATION: C.ochreDk, VACCINATION: C.terra, TRAITEMENT: C.leafDk, RENDEMENT: C.ochre }[r.type];
              return (
                <div key={r.id} style={{ display: "flex", gap: 13, alignItems: "center", padding: "13px 6px", borderBottom: `1px solid ${C.millet}` }}>
                  <span style={{ width: 38, height: 38, borderRadius: 10, background: col + "15", display: "grid", placeItems: "center", flexShrink: 0 }}><M size={17} color={col} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: C.soil }}>{r.detail}</div>
                    <div style={{ fontSize: 11.5, color: "#6E9180" }}>{RECORD_TYPE_LABELS[r.type]} · {r.farmType === "AVICOLE" ? "Avicole" : "Agricole"}{r.quantity ? ` · ${r.quantity}` : ""} · {ZONE_LABELS[r.zone]}</div>
                  </div>
                  <span style={{ fontSize: 12, color: "#6E9180", whiteSpace: "nowrap" }}>{fmtDate(r.occurredAt)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Page>
  );
}

const fieldBox = { background: C.millet, borderRadius: 13, padding: 15, marginBottom: 16, border: `1px solid ${C.line}` };
const F2 = ({ children }) => <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{children}</div>;
const SectionLabel = ({ icon: Ic, children }) => <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 12.5, color: C.leafDk, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 12 }}><Ic size={15} /> {children}</div>;
