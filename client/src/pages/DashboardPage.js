import React, { useEffect, useState } from "react";
import { Egg, Wheat, TrendingUp, Bell, Syringe, Pill, ChevronRight } from "lucide-react";
import { producerApi } from "../api/index.js";
import { C, card, fmtDate, RECORD_TYPE_LABELS } from "../styles/theme.js";
import { Page, Stat, ScoreRing, Row, H, Spinner, ErrorBanner, ghostBtn } from "../components/ui.js";

const recIcon = (t) => ({ ALIMENTATION: Wheat, VACCINATION: Syringe, TRAITEMENT: Pill, RENDEMENT: TrendingUp }[t] || TrendingUp);

export default function DashboardPage({ go }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    producerApi.dashboard().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <Page title="Tableau de bord"><ErrorBanner message={error} /></Page>;
  if (!data) return <Page title="Tableau de bord"><Spinner /></Page>;

  const { stats, recentRecords } = data;

  return (
    <Page title="Tableau de bord" subtitle="Vue d'ensemble de votre exploitation">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }} className="grid4">
        <Stat icon={Egg} label="Volailles en élevage" value={stats.poultryCount.toLocaleString("fr-FR")} sub="cheptel déclaré" accent={C.ochre} />
        <Stat icon={Wheat} label="Surface cultivée" value={`${stats.hectares} ha`} sub="parcelles" accent={C.leaf} />
        <Stat icon={TrendingUp} label="Saisies ce mois" value={stats.monthlyRecords} sub="activités enregistrées" accent={C.ochreDk} />
        <Stat icon={Bell} label="Alertes actives" value={stats.activeAlerts} sub={`${stats.urgentAlerts} urgentes`} accent={C.terra} />
      </div>

      <div className="dash-2col" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, marginTop: 18 }}>
        <div style={{ ...card, padding: 20 }}>
          <Row><H>Dernières saisies</H><button onClick={() => go("registre")} style={{ background: "none", border: "none", color: C.ochreDk, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>Enregistrer</button></Row>
          <div style={{ marginTop: 10 }}>
            {recentRecords.length === 0 && <div style={{ padding: "30px 0", textAlign: "center", color: "#6E9180", fontSize: 13.5 }}>Aucune activité pour l'instant.</div>}
            {recentRecords.map((r) => {
              const M = recIcon(r.type);
              return (
                <div key={r.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "11px 4px", borderBottom: `1px solid ${C.millet}` }}>
                  <M size={16} color={C.leaf} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: C.soil, fontWeight: 500 }}>{r.detail}</div>
                    <div style={{ fontSize: 11, color: "#6E9180" }}>{RECORD_TYPE_LABELS[r.type]} · {r.farmType === "AVICOLE" ? "Avicole" : "Agricole"}</div>
                  </div>
                  <span style={{ fontSize: 11.5, color: "#6E9180" }}>{fmtDate(r.occurredAt)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ ...card, padding: 20, display: "flex", flexDirection: "column" }}>
          <Row><H>Score Producteur</H></Row>
          <div style={{ display: "grid", placeItems: "center", flex: 1, padding: "8px 0" }}><ScoreRing score={stats.score} /></div>
          <button onClick={() => go("score")} style={ghostBtn}>Voir le détail <ChevronRight size={15} /></button>
        </div>
      </div>
    </Page>
  );
}
