import React, { useEffect, useState, useCallback } from "react";
import { Bird, Sprout, Activity } from "lucide-react";
import { scoreApi } from "../api/index.js";
import { C, card, barColor } from "../styles/theme.js";
import { Page, H, Tag, ScoreRing, Spinner, ErrorBanner } from "../components/ui.js";

export default function ScorePage() {
  const [view, setView] = useState("AVICOLE");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setResult(await scoreApi.get(view)); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [view]);

  useEffect(() => { load(); }, [load]);

  return (
    <Page title="Score Producteur ATED‑360" subtitle="Évaluation construite sur vos données opérationnelles et financières.">
      <ErrorBanner message={error} />
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {[["AVICOLE", Bird, "Volet avicole"], ["AGRICOLE", Sprout, "Volet agricole"]].map(([v, Ic, lbl]) => {
          const on = view === v;
          return <button key={v} onClick={() => setView(v)} style={{ display: "flex", gap: 8, alignItems: "center", padding: "9px 16px", borderRadius: 999, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13.5, background: on ? C.soil : "#fff", color: on ? "#fff" : "#3A6B4D", boxShadow: on ? "none" : `inset 0 0 0 1.5px ${C.line}` }}><Ic size={15} /> {lbl}</button>;
        })}
      </div>

      {loading || !result ? <Spinner /> : (
        <div className="dash-2col" style={{ display: "grid", gridTemplateColumns: ".8fr 1.2fr", gap: 18 }}>
          <div style={{ ...card, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <ScoreRing score={result.global} size={190} />
            <div style={{ marginTop: 18 }}><Tag bg={C.ochre + "1A"} fg={C.ochreDk}>{result.global >= 75 ? "Profil solide · Éligible au financement" : "Profil à consolider"}</Tag></div>
            <p style={{ fontSize: 13, color: "#3A6B4D", marginTop: 16, lineHeight: 1.55 }}>Votre score combine vos pratiques de terrain ({view.toLowerCase()}), la régularité de vos saisies et votre santé financière. Il se met à jour à chaque enregistrement.</p>
          </div>
          <div style={{ ...card, padding: 22 }}>
            <H>Détail des critères — volet {view.toLowerCase()}</H>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 17 }}>
              {Object.entries(result.breakdown).map(([key, val]) => (
                <div key={key}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5, color: C.soil, flex: 1 }}>{key}</span>
                    <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 16, color: barColor(val) }}>{val}</span>
                  </div>
                  <div style={{ height: 9, borderRadius: 999, background: C.millet, overflow: "hidden" }}><div style={{ width: `${val}%`, height: "100%", borderRadius: 999, background: barColor(val) }} /></div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, padding: 15, borderRadius: 12, background: C.millet, display: "flex", gap: 11 }}>
              <Activity size={18} color={C.leafDk} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 12.5, color: "#2D5A3E", lineHeight: 1.5 }}>
                <strong style={{ color: C.soil }}>Pour gagner des points :</strong> {view === "AVICOLE" ? "respectez le calendrier vaccinal, renforcez la biosécurité et enregistrez vos activités régulièrement." : "documentez vos apports d'intrants, suivez la fertilité du sol et tenez à jour vos rendements."}
              </div>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
