import React, { useEffect, useState, useCallback } from "react";
import { UserCircle, MapPin, Sprout, X, Plus, Bird, FileText, Upload, Image, Video, File as FileIcon, Trash2, Building2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import { producerApi } from "../api/index.js";
import { C, card, lblS, inpS, fmtDate } from "../styles/theme.js";
import { Page, H, ErrorBanner, Tag } from "../components/ui.js";
import { CULTURES } from "../data/cultures.js";

const PROOF_TYPES = [
  { id: "PHOTO", label: "Photo", icon: Image },
  { id: "VIDEO", label: "Vidéo", icon: Video },
  { id: "DOCUMENT", label: "Document", icon: FileIcon },
];

export default function ProfilPage() {
  const { user, refreshUser } = useAuth();
  const producer = user?.producer;

  const [farmType, setFarmType] = useState(producer?.farmType || "MIXTE");
  const [fieldLocation, setFieldLocation] = useState(producer?.fieldLocation || "");
  const [poultryCount, setPoultryCount] = useState(producer?.poultryCount ?? 0);
  const [hectares, setHectares] = useState(producer?.hectares ?? 0);
  const [cultures, setCultures] = useState(producer?.cultures || []);
  const [autreCulture, setAutreCulture] = useState("");

  const [startYear, setStartYear] = useState(producer?.startYear ?? "");
  const [investedAmount, setInvestedAmount] = useState(producer?.investedAmount || "");
  const [youthEmployed, setYouthEmployed] = useState(producer?.youthEmployed ?? "");
  const [womenEmployed, setWomenEmployed] = useState(producer?.womenEmployed ?? "");
  const [annualRevenue, setAnnualRevenue] = useState(producer?.annualRevenue || "");
  const [legalStatus, setLegalStatus] = useState(producer?.legalStatus || "");
  const [challenges, setChallenges] = useState(producer?.challenges || "");
  const [achievements, setAchievements] = useState(producer?.achievements || "");
  const [outlook, setOutlook] = useState(producer?.outlook || "");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const [cvBusy, setCvBusy] = useState(false);
  const [cvError, setCvError] = useState("");

  const [proofs, setProofs] = useState([]);
  const [proofType, setProofType] = useState("PHOTO");
  const [proofLabel, setProofLabel] = useState("");
  const [proofBusy, setProofBusy] = useState(false);
  const [proofError, setProofError] = useState("");

  const loadProofs = useCallback(async () => {
    try { setProofs(await producerApi.listProofs()); } catch { /* silencieux : section secondaire */ }
  }, []);
  useEffect(() => { loadProofs(); }, [loadProofs]);

  const toggleCulture = (c) => {
    setCultures((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const addAutreCulture = () => {
    const v = autreCulture.trim();
    if (!v || cultures.includes(v)) return;
    setCultures((prev) => [...prev, v]);
    setAutreCulture("");
  };

  const submit = async () => {
    setBusy(true); setError(""); setOkMsg("");
    try {
      await producerApi.updateProfile({
        farmType,
        fieldLocation: fieldLocation || undefined,
        poultryCount: Number(poultryCount) || 0,
        hectares: Number(hectares) || 0,
        cultures,
        startYear: startYear ? Number(startYear) : undefined,
        investedAmount: investedAmount || undefined,
        youthEmployed: youthEmployed !== "" ? Number(youthEmployed) : undefined,
        womenEmployed: womenEmployed !== "" ? Number(womenEmployed) : undefined,
        annualRevenue: annualRevenue || undefined,
        legalStatus: legalStatus || undefined,
        challenges: challenges || undefined,
        achievements: achievements || undefined,
        outlook: outlook || undefined,
      });
      await refreshUser();
      setOkMsg("Profil mis à jour.");
      setTimeout(() => setOkMsg(""), 3000);
    } catch (e) {
      setError(e.details?.map((d) => d.message).join(" · ") || e.message);
    } finally {
      setBusy(false);
    }
  };

  const onCvChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvBusy(true); setCvError("");
    try {
      await producerApi.uploadCv(file);
      await refreshUser();
    } catch (err) {
      setCvError(err.message);
    } finally {
      setCvBusy(false);
      e.target.value = "";
    }
  };

  const onProofFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofBusy(true); setProofError("");
    try {
      await producerApi.addProof(file, proofType, proofLabel || undefined);
      setProofLabel("");
      await loadProofs();
    } catch (err) {
      setProofError(err.message);
    } finally {
      setProofBusy(false);
      e.target.value = "";
    }
  };

  const deleteProof = async (id) => {
    try {
      await producerApi.removeProof(id);
      await loadProofs();
    } catch (err) {
      setProofError(err.message);
    }
  };

  return (
    <Page title="Mon profil" subtitle="Informations personnelles, présentation de votre structure et preuves de vos activités.">
      <ErrorBanner message={error} />
      {okMsg && (
        <div style={{ ...card, padding: "12px 15px", marginBottom: 14, background: C.millet, border: `1px solid ${C.leaf}`, color: C.leafDk, fontSize: 13.5, fontWeight: 600 }}>{okMsg}</div>
      )}

      <div className="dash-2col" style={{ display: "grid", gridTemplateColumns: ".9fr 1.1fr", gap: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, alignSelf: "start" }}>
          <div style={{ ...card, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}><UserCircle size={19} color={C.leafDk} /><H>Informations personnelles</H></div>
            <label style={lblS}>Nom et prénoms</label>
            <div style={fieldRO}>{user?.fullName || "—"}</div>
            <label style={lblS}>E‑mail</label>
            <div style={fieldRO}>{user?.email || "—"}</div>
            <label style={lblS}>Téléphone</label>
            <div style={fieldRO}>{user?.phone || "—"}</div>
            {user?.dateOfBirth && (
              <>
                <label style={lblS}>Date de naissance</label>
                <div style={fieldRO}>{fmtDate(user.dateOfBirth)}</div>
              </>
            )}
          </div>

          <div style={{ ...card, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><FileText size={19} color={C.leafDk} /><H>Mon CV</H></div>
            <p style={{ fontSize: 11.5, color: "#6E9180", margin: "0 0 12px" }}>Visible par les partenaires qui analysent votre projet.</p>
            <ErrorBanner message={cvError} />
            {producer?.cvUrl && (
              <a href={producer.cvUrl} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: C.ochreDk, marginBottom: 12, textDecoration: "underline" }}>
                <FileText size={14} /> Voir mon CV actuel
              </a>
            )}
            <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 0", borderRadius: 11, border: `1.5px dashed ${C.line}`, cursor: "pointer", fontSize: 13, fontWeight: 600, color: C.leafDk, background: "#FAFDFB" }}>
              <Upload size={15} /> {cvBusy ? "Envoi…" : producer?.cvUrl ? "Remplacer mon CV" : "Téléverser mon CV"}
              <input type="file" accept=".pdf,.doc,.docx" onChange={onCvChange} disabled={cvBusy} style={{ display: "none" }} />
            </label>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ ...card, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}><Sprout size={19} color={C.leafDk} /><H>Mon exploitation</H></div>

            <label style={lblS}>Type de ferme</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {[["AVICOLE", Bird, "Avicole"], ["AGRICOLE", Sprout, "Agricole"], ["MIXTE", Sprout, "Mixte"]].map(([v, Ic, lbl]) => {
                const on = farmType === v;
                return <button key={v} onClick={() => setFarmType(v)} style={{ flex: 1, display: "flex", justifyContent: "center", gap: 7, alignItems: "center", padding: "9px 0", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700, border: `1.5px solid ${on ? C.leaf : C.line}`, background: on ? C.leaf + "14" : "#fff", color: on ? C.leafDk : "#3A6B4D" }}><Ic size={15} /> {lbl}</button>;
              })}
            </div>

            <label style={lblS}><MapPin size={12} style={{ verticalAlign: "-2px" }} /> Localisation du champ</label>
            <input value={fieldLocation} onChange={(e) => setFieldLocation(e.target.value)} placeholder="Ex. Parcelle nord, village de Kobaya" style={inpS} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><label style={lblS}>Effectif (volailles/cheptel)</label>
                <input type="number" min="0" value={poultryCount} onChange={(e) => setPoultryCount(e.target.value)} style={inpS} /></div>
              <div><label style={lblS}>Surface (ha)</label>
                <input type="number" min="0" step="0.1" value={hectares} onChange={(e) => setHectares(e.target.value)} style={inpS} /></div>
            </div>

            <label style={lblS}>Cultures pratiquées</label>
            <p style={{ fontSize: 11.5, color: "#6E9180", margin: "0 0 8px" }}>Cochez toutes les cultures que vous pratiquez — le suivi et les partenaires afficheront l'ensemble de vos cultures déclarées.</p>

            {cultures.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                {cultures.map((c) => (
                  <span key={c} style={{ display: "flex", alignItems: "center", gap: 5, background: C.leaf + "1A", color: C.leafDk, fontSize: 12, fontWeight: 600, padding: "4px 6px 4px 10px", borderRadius: 999 }}>
                    {c}
                    <button onClick={() => toggleCulture(c)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "grid", placeItems: "center", color: C.leafDk }}><X size={12} /></button>
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, maxHeight: 220, overflowY: "auto", padding: 10, border: `1px solid ${C.line}`, borderRadius: 11, background: "#FAFDFB", marginBottom: 10 }}>
              {CULTURES.map((c) => {
                const on = cultures.includes(c);
                return (
                  <label key={c} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: on ? C.leafDk : "#3A6B4D", fontWeight: on ? 700 : 500, cursor: "pointer" }}>
                    <input type="checkbox" checked={on} onChange={() => toggleCulture(c)} />
                    {c}
                  </label>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <input value={autreCulture} onChange={(e) => setAutreCulture(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addAutreCulture()} placeholder="Autre culture (ex. Baobab, Néré…)" style={{ ...inpS, marginBottom: 0, flex: 1 }} />
              <button onClick={addAutreCulture} style={{ padding: "0 16px", border: "none", borderRadius: 11, background: C.millet, color: C.leafDk, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Plus size={15} /> Ajouter</button>
            </div>
          </div>

          <div style={{ ...card, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><Building2 size={19} color={C.leafDk} /><H>Présentation de ma structure</H></div>
            <p style={{ fontSize: 11.5, color: "#6E9180", margin: "0 0 14px" }}>Ces informations renforcent la crédibilité de votre profil auprès des partenaires.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><label style={lblS}>Année de démarrage</label>
                <input type="number" value={startYear} onChange={(e) => setStartYear(e.target.value)} placeholder="2019" style={inpS} /></div>
              <div><label style={lblS}>Statut</label>
                <select value={legalStatus} onChange={(e) => setLegalStatus(e.target.value)} style={inpS}>
                  <option value="">— choisir —</option>
                  <option value="Formel">Formel (registre de commerce, agrément…)</option>
                  <option value="Informel">Informel</option>
                </select></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><label style={lblS}>Montants investis</label>
                <input value={investedAmount} onChange={(e) => setInvestedAmount(e.target.value)} placeholder="Ex. 15 000 000 GNF" style={inpS} /></div>
              <div><label style={lblS}>Chiffre d'affaires annuel</label>
                <input value={annualRevenue} onChange={(e) => setAnnualRevenue(e.target.value)} placeholder="Ex. 40 000 000 GNF" style={inpS} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><label style={lblS}>Jeunes employés</label>
                <input type="number" min="0" value={youthEmployed} onChange={(e) => setYouthEmployed(e.target.value)} style={inpS} /></div>
              <div><label style={lblS}>Femmes employées</label>
                <input type="number" min="0" value={womenEmployed} onChange={(e) => setWomenEmployed(e.target.value)} style={inpS} /></div>
            </div>
            <label style={lblS}>Réussites</label>
            <textarea value={achievements} onChange={(e) => setAchievements(e.target.value)} rows={2} placeholder="Vos principales réussites…" style={{ ...inpS, resize: "vertical" }} />
            <label style={lblS}>Échecs / difficultés rencontrées</label>
            <textarea value={challenges} onChange={(e) => setChallenges(e.target.value)} rows={2} placeholder="Difficultés rencontrées…" style={{ ...inpS, resize: "vertical" }} />
            <label style={lblS}>Perspectives / espoirs</label>
            <textarea value={outlook} onChange={(e) => setOutlook(e.target.value)} rows={2} placeholder="Vos projets pour la suite…" style={{ ...inpS, resize: "vertical" }} />

            <button onClick={submit} disabled={busy} style={{ width: "100%", padding: "12px 0", border: "none", borderRadius: 11, background: busy ? "#9CC4AC" : C.ochre, color: "#fff", fontWeight: 700, fontSize: 14, cursor: busy ? "default" : "pointer", marginTop: 6 }}>
              {busy ? "Enregistrement…" : "Enregistrer les modifications"}
            </button>
          </div>

          <div style={{ ...card, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><Image size={19} color={C.leafDk} /><H>Preuves (photos, vidéos, documents)</H></div>
            <p style={{ fontSize: 11.5, color: "#6E9180", margin: "0 0 14px" }}>Illustrez vos cultures/activités et justifiez le statut de votre structure (registre de commerce, agrément…).</p>
            <ErrorBanner message={proofError} />

            {proofs.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {proofs.map((p) => {
                  const meta = PROOF_TYPES.find((t) => t.id === p.type) || PROOF_TYPES[2];
                  const Ic = meta.icon;
                  return (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 10, border: `1px solid ${C.line}` }}>
                      <Ic size={16} color={C.leafDk} />
                      <a href={p.url} target="_blank" rel="noreferrer" style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: C.soil, textDecoration: "underline", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.label || meta.label}</a>
                      <Tag bg={C.millet} fg="#3A6B4D">{meta.label}</Tag>
                      <button onClick={() => deleteProof(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.terra, padding: 4 }}><Trash2 size={15} /></button>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {PROOF_TYPES.map((t) => {
                const on = proofType === t.id; const Ic = t.icon;
                return <button key={t.id} onClick={() => setProofType(t.id)} style={{ flex: 1, display: "flex", justifyContent: "center", gap: 6, alignItems: "center", padding: "8px 0", borderRadius: 9, cursor: "pointer", fontSize: 12.5, fontWeight: 700, border: `1.5px solid ${on ? C.ochre : C.line}`, background: on ? C.ochre + "12" : "#fff", color: on ? C.ochreDk : "#3A6B4D" }}><Ic size={14} /> {t.label}</button>;
              })}
            </div>
            <input value={proofLabel} onChange={(e) => setProofLabel(e.target.value)} placeholder="Légende (ex. Registre de commerce, Parcelle riz…)" style={inpS} />
            <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 0", borderRadius: 11, border: `1.5px dashed ${C.line}`, cursor: "pointer", fontSize: 13, fontWeight: 600, color: C.leafDk, background: "#FAFDFB" }}>
              <Upload size={15} /> {proofBusy ? "Envoi…" : "Téléverser un fichier"}
              <input type="file" accept={proofType === "PHOTO" ? "image/*" : proofType === "VIDEO" ? "video/*" : ".pdf,.doc,.docx,image/*"} onChange={onProofFileChange} disabled={proofBusy} style={{ display: "none" }} />
            </label>
          </div>
        </div>
      </div>
    </Page>
  );
}

const fieldRO = { padding: "9px 11px", borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 13, color: C.soil, background: "#F6FBF8", marginBottom: 13 };
