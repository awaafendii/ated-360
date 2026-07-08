import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Wheat, Syringe, Pill, TrendingUp, Bird, Sprout, Plus, Ruler, FlaskConical, MapPin, Tractor, Sprout as Seed, Scissors, CloudRain, Skull, Egg, HelpCircle } from "lucide-react";
import { recordsApi } from "../api/index.js";
import { useAuth } from "../context/AuthContext.js";
import { C, card, lblS, inpS, fmtDate, ZONES, ZONE_LABELS } from "../styles/theme.js";
import { Page, Row, H, Spinner, ErrorBanner } from "../components/ui.js";
import { CULTURES_WITH_AUTRE, AUTRE_CULTURE, VARIETES_PAR_CULTURE } from "../data/cultures.js";

/* Activités par profil. Chaque activité visible est rattachée à un
   "type" technique existant en base, pour éviter toute migration.
   "help" = aide contextuelle affichée sous le libellé lorsque l'activité est sélectionnée. */
const AGRI_ACTIVITIES = [
  { key: "PREPA_SOL",     label: "Préparation sol", type: "TRAITEMENT",   icon: Tractor,  help: "Labour, hersage ou tout travail du sol avant semis." },
  { key: "SEMIS",         label: "Semis",           type: "ALIMENTATION", icon: Seed,     help: "Mise en terre des graines ou plants sur la parcelle." },
  { key: "FERTILISATION", label: "Fertilisation",   type: "TRAITEMENT",   icon: FlaskConical, help: "Apport d'engrais organique ou minéral (précisez l'intrant ci-dessous)." },
  { key: "DESHERBAGE",    label: "Désherbage",      type: "TRAITEMENT",   icon: Scissors, help: "Élimination manuelle ou chimique des mauvaises herbes." },
  { key: "TRAITEMENT",    label: "Traitement",      type: "TRAITEMENT",   icon: Pill,     help: "Application d'un produit phytosanitaire contre maladies ou nuisibles." },
  { key: "IRRIGATION",    label: "Irrigation",      type: "TRAITEMENT",   icon: CloudRain,help: "Apport d'eau en dehors des pluies naturelles." },
  { key: "RECOLTE",       label: "Récolte",         type: "RENDEMENT",    icon: Wheat,    help: "Collecte de la production ; le rendement (t/ha) est calculé automatiquement." },
];
const AVI_ACTIVITIES = [
  { key: "ALIMENTATION", label: "Alimentation",      type: "ALIMENTATION", icon: Wheat,   help: "Distribution de nourriture ou de compléments à la volaille/au cheptel." },
  { key: "VACCINATION",  label: "Vaccination",       type: "VACCINATION",  icon: Syringe, help: "Administration d'un vaccin ; précisez lequel ci-dessous." },
  { key: "TRAITEMENT",   label: "Traitement",        type: "TRAITEMENT",   icon: Pill,    help: "Traitement médical ou antiparasitaire du cheptel." },
  { key: "MORTALITE",    label: "Mortalité",         type: "RENDEMENT",    icon: Skull,   help: "Déclaration des sujets morts ; le taux de mortalité est calculé automatiquement." },
  { key: "PONTE",        label: "Ponte / Rendement", type: "RENDEMENT",    icon: Egg,     help: "Production du jour (œufs, lait, etc.)." },
];
const ACT_BY_KEY = Object.fromEntries([...AGRI_ACTIVITIES, ...AVI_ACTIVITIES].map((a) => [a.key, a]));

/* Espèces avicoles + races associées (souches courantes en Afrique de l'Ouest). */
const ESPECES = ["Pondeuse", "Poulet de chair", "Pintade", "Coq local", "Canard", "Dinde", "Lapin"];
const RACES_PAR_ESPECE = {
  "Pondeuse": ["ISA Brown", "Lohmann Brown", "Bovans Brown", "Hisex", "Novogen", "Rhode Island Red", "Leghorn"],
  "Poulet de chair": ["Cobb 500", "Ross 308", "Coquelet", "Sasso", "Hubbard", "Redbro", "Kuroiler", "Goliath"],
  "Pintade": ["Pintade locale (grise)", "Pintade à plumage perlé", "Pintade améliorée"],
  "Coq local": ["Poulet du pays (bicyclette)", "Coq local amélioré", "Wassache"],
  "Canard": ["Canard de Barbarie", "Canard Pékin", "Canard local"],
  "Dinde": ["Dinde locale", "Dinde Nicholas", "Dinde BUT"],
  "Lapin": ["Lapin Néo-Zélandais Blanc", "Lapin local amélioré", "Lapin croisé local", "Californien", "Lapin Rex"],
};

export default function RegistrePage() {
  const { user } = useAuth();
  const profil = user?.producer?.farmType || "MIXTE";
  const canAvi = profil === "AVICOLE" || profil === "MIXTE";
  const canAgri = profil === "AGRICOLE" || profil === "MIXTE";

  const [cat, setCat] = useState(canAvi ? "AVICOLE" : "AGRICOLE");
  const [filter, setFilter] = useState("Tous");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [okMsg, setOkMsg] = useState("");

  const activities = cat === "AVICOLE" ? AVI_ACTIVITIES : AGRI_ACTIVITIES;
  const [activityKey, setActivityKey] = useState(activities[0].key);

  const [base, setBase] = useState({ detail: "", zone: "CONAKRY" });
  const [avi, setAvi] = useState({ espece: "Pondeuse", race: "", effectifInitial: "", morts: "", ponte: "", vaccin: "" });
  const [agri, setAgri] = useState({ culture: "Riz", cultureAutre: "", variete: "", surface: "", typeSol: "Argilo-limoneux", intrant: "", production: "" });

  useEffect(() => {
    const list = cat === "AVICOLE" ? AVI_ACTIVITIES : AGRI_ACTIVITIES;
    setActivityKey(list[0].key);
  }, [cat]);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { items } = await recordsApi.list({ limit: 50 });
      setItems(items);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  // Rendement agricole = production ÷ surface (t/ha)
  const rendementCalcule = useMemo(() => {
    const prod = parseFloat(String(agri.production).replace(",", "."));
    const surf = parseFloat(String(agri.surface).replace(",", "."));
    if (!prod || !surf || surf <= 0) return null;
    return +(prod / surf).toFixed(2);
  }, [agri.production, agri.surface]);

  // Taux de mortalité = (morts ÷ effectif initial) × 100
  const mortaliteCalculee = useMemo(() => {
    const morts = parseFloat(String(avi.morts).replace(",", "."));
    const eff = parseFloat(String(avi.effectifInitial).replace(",", "."));
    if (isNaN(morts) || !eff || eff <= 0) return null;
    return +((morts / eff) * 100).toFixed(2);
  }, [avi.morts, avi.effectifInitial]);

  const submit = async () => {
    if (!base.detail.trim()) { setError("La description est requise."); return; }
    setBusy(true); setError(""); setOkMsg("");
    const activity = ACT_BY_KEY[activityKey];
    let details = {};
    let quantity = "";

    if (cat === "AVICOLE") {
      details = { sousType: activity.label, espece: avi.espece, race: avi.race || undefined, effectif: avi.effectifInitial || undefined };
      if (activityKey === "VACCINATION") details.vaccin = avi.vaccin || undefined;
      if (activityKey === "MORTALITE") {
        details.effectifInitial = avi.effectifInitial || undefined;
        details.morts = avi.morts || undefined;
        details.mortalitePct = mortaliteCalculee ?? undefined;
        quantity = mortaliteCalculee != null ? `Mortalité ${mortaliteCalculee}%` : "";
      }
      if (activityKey === "PONTE") {
        details.ponteParJour = avi.ponte || undefined;
        quantity = avi.ponte ? `${avi.ponte} oeufs/j` : "";
      }
    } else {
      const cultureFinale = agri.culture === AUTRE_CULTURE ? (agri.cultureAutre || AUTRE_CULTURE) : agri.culture;
      details = { phase: activity.label, culture: cultureFinale, variete: agri.variete || undefined, surfaceHa: agri.surface || undefined, typeSol: agri.typeSol || undefined, intrant: agri.intrant || undefined };
      if (activityKey === "RECOLTE") {
        details.productionTotale = agri.production || undefined;
        details.rendementTHa = rendementCalcule ?? undefined;
        quantity = rendementCalcule != null ? `${rendementCalcule} t/ha` : "";
      }
    }

    try {
      await recordsApi.create({ type: activity.type, farmType: cat, detail: base.detail, quantity: quantity || undefined, zone: base.zone, details });
      setBase({ ...base, detail: "" });
      setOkMsg("Activité enregistrée. Votre score est mis à jour.");
      setTimeout(() => setOkMsg(""), 3500);
      await load();
    } catch (e) {
      setError(e.details?.map((d) => d.message).join(" · ") || e.message);
    } finally { setBusy(false); }
  };

  const histFilters = useMemo(() => {
    const s = ["Tous"];
    if (canAvi) s.push("Avicole");
    if (canAgri) s.push("Agricole");
    return s;
  }, [canAvi, canAgri]);

  const filteredItems = items.filter((r) => {
    if (filter === "Avicole") return r.farmType === "AVICOLE";
    if (filter === "Agricole") return r.farmType === "AGRICOLE";
    return true;
  });

  const iconFor = (r) => {
    const k = r.details?.sousType || r.details?.phase;
    const found = [...AGRI_ACTIVITIES, ...AVI_ACTIVITIES].find((a) => a.label === k);
    return found ? found.icon : TrendingUp;
  };

  return (
    <Page title="Registre digital" subtitle={`Profil : ${profilLabel(profil)} — saisissez vos activités, votre score se met à jour en temps réel.`}>
      <ErrorBanner message={error} />
      {okMsg && (
        <div style={{ ...card, padding: "12px 15px", marginBottom: 14, background: C.millet, border: `1px solid ${C.leaf}`, color: C.leafDk, fontSize: 13.5, fontWeight: 600 }}>{okMsg}</div>
      )}

      <div className="dash-2col" style={{ display: "grid", gridTemplateColumns: ".95fr 1.05fr", gap: 18 }}>
        <div style={{ ...card, padding: 20, alignSelf: "start" }}>
          <H>Nouvelle saisie</H>

          <div style={{ marginTop: 13 }}>
            <label style={lblS}>Nom et prénoms</label>
            <div style={{ padding: "9px 11px", borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 13, color: C.soil, background: "#F6FBF8" }}>{user?.fullName || "—"}</div>
          </div>

          <div style={{ marginTop: 11 }}>
            <label style={lblS}><MapPin size={12} style={{ verticalAlign: "-2px" }} /> Zone d'exploitation</label>
            <select value={base.zone} onChange={(e) => setBase({ ...base, zone: e.target.value })} style={inpS}>
              {ZONES.map((z) => <option key={z} value={z}>{ZONE_LABELS[z]}</option>)}
            </select>
          </div>

          {profil === "MIXTE" && (
            <>
              <label style={lblS}>Type de ferme</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {[["AVICOLE", Bird, "Avicole"], ["AGRICOLE", Sprout, "Agricole"]].map(([c, Ic, lbl]) => {
                  const on = cat === c;
                  return <button key={c} onClick={() => setCat(c)} style={{ flex: 1, display: "flex", justifyContent: "center", gap: 7, alignItems: "center", padding: "9px 0", borderRadius: 10, cursor: "pointer", fontSize: 13.5, fontWeight: 700, border: `1.5px solid ${on ? C.leaf : C.line}`, background: on ? C.leaf + "14" : "#fff", color: on ? C.leafDk : "#3A6B4D" }}><Ic size={16} /> {lbl}</button>;
                })}
              </div>
            </>
          )}

          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <label style={lblS}>{cat === "AGRICOLE" ? "Phase culturale" : "Type d'activité"}</label>
            <span style={{ fontSize: 10.5, color: "#9CC4AC", fontWeight: 600 }}>Une seule activité à la fois</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            {activities.map((a) => {
              const on = activityKey === a.key; const Ic = a.icon;
              return (
                <button key={a.key} onClick={() => setActivityKey(a.key)} title={a.help} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 11px", borderRadius: 10, cursor: "pointer", fontSize: 12.5, fontWeight: 600, border: `1.5px solid ${on ? C.ochre : C.line}`, background: on ? C.ochre + "12" : "#fff", color: on ? C.ochreDk : "#3A6B4D", textAlign: "left" }}>
                  <Ic size={15} /> {a.label}
                </button>
              );
            })}
          </div>
          {ACT_BY_KEY[activityKey]?.help && (
            <div style={{ display: "flex", gap: 7, alignItems: "flex-start", fontSize: 11.5, color: "#6E9180", marginBottom: 14, padding: "8px 10px", background: C.millet, borderRadius: 9 }}>
              <HelpCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} /> {ACT_BY_KEY[activityKey].help}
            </div>
          )}

          {cat === "AVICOLE" && (
            <div style={fieldBox}>
              <SectionLabel icon={Bird}>Informations avicoles</SectionLabel>
              <F2>
                <div><label style={lblS}>Espèce</label>
                  <select value={avi.espece} onChange={(e) => setAvi({ ...avi, espece: e.target.value, race: "" })} style={inpS}>
                    {ESPECES.map((x) => <option key={x}>{x}</option>)}
                  </select></div>
                <div><label style={lblS}>Race / souche</label>
                  <select value={avi.race} onChange={(e) => setAvi({ ...avi, race: e.target.value })} style={inpS}>
                    <option value="">— choisir —</option>
                    {(RACES_PAR_ESPECE[avi.espece] || []).map((r) => <option key={r}>{r}</option>)}
                  </select></div>
              </F2>
              <div><label style={lblS}>Effectif initial</label>
                <input value={avi.effectifInitial} onChange={(e) => setAvi({ ...avi, effectifInitial: e.target.value })} placeholder="320" style={inpS} /></div>
              {activityKey === "VACCINATION" && (
                <div><label style={lblS}>Vaccin administré</label>
                  <select value={avi.vaccin} onChange={(e) => setAvi({ ...avi, vaccin: e.target.value })} style={inpS}>
                    {["", "Newcastle", "Gumboro", "Variole aviaire", "Bronchite infectieuse"].map((x) => <option key={x} value={x}>{x || "—"}</option>)}
                  </select></div>
              )}
              {activityKey === "MORTALITE" && (
                <>
                  <div><label style={lblS}>Nombre de sujets morts</label>
                    <input value={avi.morts} onChange={(e) => setAvi({ ...avi, morts: e.target.value })} placeholder="8" style={inpS} /></div>
                  <CalcBox label="Taux de mortalité calculé" value={mortaliteCalculee != null ? `${mortaliteCalculee} %` : "—"} hint="(morts ÷ effectif initial) × 100" danger={mortaliteCalculee != null && mortaliteCalculee > 5} />
                </>
              )}
              {activityKey === "PONTE" && (
                <div><label style={lblS}>Ponte du jour (œufs)</label>
                  <input value={avi.ponte} onChange={(e) => setAvi({ ...avi, ponte: e.target.value })} placeholder="284" style={inpS} /></div>
              )}
            </div>
          )}

          {cat === "AGRICOLE" && (
            <div style={fieldBox}>
              <SectionLabel icon={Sprout}>Informations agricoles</SectionLabel>
              <F2>
                <div><label style={lblS}>Culture</label>
                  <select value={agri.culture} onChange={(e) => setAgri({ ...agri, culture: e.target.value, variete: "" })} style={inpS}>
                    {CULTURES_WITH_AUTRE.map((x) => <option key={x}>{x}</option>)}
                  </select></div>
                <div><label style={lblS}>Variété</label>
                  <select value={agri.variete} onChange={(e) => setAgri({ ...agri, variete: e.target.value })} style={inpS} disabled={agri.culture === AUTRE_CULTURE}>
                    <option value="">— choisir —</option>
                    {(VARIETES_PAR_CULTURE[agri.culture] || []).map((v) => <option key={v}>{v}</option>)}
                  </select></div>
              </F2>
              {agri.culture === AUTRE_CULTURE && (
                <div><label style={lblS}>Précisez la culture</label>
                  <input value={agri.cultureAutre} onChange={(e) => setAgri({ ...agri, cultureAutre: e.target.value })} placeholder="Ex. Baobab, Néré…" style={inpS} /></div>
              )}
              <F2>
                <div><label style={lblS}><Ruler size={11} /> Surface (ha)</label>
                  <input value={agri.surface} onChange={(e) => setAgri({ ...agri, surface: e.target.value })} placeholder="2.5" style={inpS} /></div>
                <div><label style={lblS}>Type de sol</label>
                  <select value={agri.typeSol} onChange={(e) => setAgri({ ...agri, typeSol: e.target.value })} style={inpS}>
                    {["Argilo-limoneux", "Sableux", "Latéritique", "Bas-fond (hydromorphe)"].map((x) => <option key={x}>{x}</option>)}
                  </select></div>
              </F2>
              <div><label style={lblS}><FlaskConical size={11} /> Intrant</label>
                <input value={agri.intrant} onChange={(e) => setAgri({ ...agri, intrant: e.target.value })} placeholder="Urée, NPK…" style={inpS} /></div>
              {activityKey === "RECOLTE" && (
                <>
                  <div><label style={lblS}>Production totale récoltée (tonnes)</label>
                    <input value={agri.production} onChange={(e) => setAgri({ ...agri, production: e.target.value })} placeholder="7.4" style={inpS} /></div>
                  <CalcBox label="Rendement calculé" value={rendementCalcule != null ? `${rendementCalcule} t/ha` : "—"} hint="production totale ÷ surface" />
                </>
              )}
            </div>
          )}

          <label style={lblS}>Description / note</label>
          <input value={base.detail} onChange={(e) => setBase({ ...base, detail: e.target.value })} placeholder={cat === "AVICOLE" ? "Ex. Lot B2, bâtiment 1" : "Ex. Parcelle nord, bas-fond"} style={inpS} />

          <button onClick={submit} disabled={busy} style={{ width: "100%", padding: "12px 0", border: "none", borderRadius: 11, background: busy ? "#9CC4AC" : C.leaf, color: "#fff", fontWeight: 700, fontSize: 14, cursor: busy ? "default" : "pointer", display: "flex", justifyContent: "center", gap: 8, alignItems: "center", marginTop: 4 }}>
            <Plus size={17} /> {busy ? "Enregistrement…" : "Enregistrer l'activité"}
          </button>
        </div>

        <div style={{ ...card, padding: 20 }}>
          <Row>
            <H>Historique</H>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {histFilters.map((t) => (
                <button key={t} onClick={() => setFilter(t)} style={{ fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: 999, cursor: "pointer", border: "none", background: filter === t ? C.soil : C.millet, color: filter === t ? "#fff" : "#3A6B4D" }}>{t}</button>
              ))}
            </div>
          </Row>
          {user?.producer?.cultures?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 10 }}>
              <span style={{ fontSize: 11, color: "#6E9180", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".03em" }}>Cultures déclarées :</span>
              {user.producer.cultures.map((c) => (
                <span key={c} style={{ fontSize: 11.5, fontWeight: 600, color: C.leafDk, background: C.leaf + "1A", padding: "3px 9px", borderRadius: 999 }}>{c}</span>
              ))}
            </div>
          )}
          <div style={{ marginTop: 12 }}>
            {loading ? <Spinner /> : filteredItems.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "#6E9180", fontSize: 13.5 }}>Aucune activité. Commencez par une saisie à gauche.</div>
            ) : filteredItems.map((r) => {
              const sousType = r.details?.sousType || r.details?.phase;
              const M = iconFor(r);
              const col = r.farmType === "AVICOLE" ? C.ochreDk : C.leafDk;
              return (
                <div key={r.id} style={{ display: "flex", gap: 13, alignItems: "center", padding: "13px 6px", borderBottom: `1px solid ${C.millet}` }}>
                  <span style={{ width: 38, height: 38, borderRadius: 10, background: col + "15", display: "grid", placeItems: "center", flexShrink: 0 }}><M size={17} color={col} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: C.soil }}>{sousType || r.detail}</div>
                    <div style={{ fontSize: 11.5, color: "#6E9180" }}>
                      {r.farmType === "AVICOLE" ? "Avicole" : "Agricole"}{r.detail && sousType ? ` · ${r.detail}` : ""}{r.quantity ? ` · ${r.quantity}` : ""} · {ZONE_LABELS[r.zone]}
                    </div>
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

function CalcBox({ label, value, hint, danger }) {
  return (
    <div style={{ marginTop: 6, padding: "12px 14px", borderRadius: 11, background: "#fff", border: `1.5px solid ${danger ? C.terra : C.leaf}` }}>
      <div style={{ fontSize: 11, color: "#6E9180", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".03em" }}>{label}</div>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 600, color: danger ? C.terra : C.leafDk, marginTop: 3, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#9CC4AC", marginTop: 4 }}>{hint}</div>
    </div>
  );
}

function profilLabel(p) {
  return p === "AVICOLE" ? "Aviculteur" : p === "AGRICOLE" ? "Agriculteur" : "Mixte (avicole + agricole)";
}
