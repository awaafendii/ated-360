import React, { useEffect, useState } from "react";
import { Egg, Wheat, TrendingUp, Bell, Syringe, Pill, ChevronRight, HelpCircle } from "lucide-react";
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

  const { stats, recentRecords, profile } = data;
  // N'affiche que les indicateurs pertinents pour le type de production déclaré,
  // pour éviter de mélanger les informations avicoles et agricoles.
  const showPoultry = profile.farmType !== "AGRICOLE";
  const showHectares = profile.farmType !== "AVICOLE";
  const statCount = (showPoultry ? 1 : 0) + (showHectares ? 1 : 0) + 2;

  return (
    <Page title="Tableau de bord" subtitle="Vue d'ensemble de votre exploitation">
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${statCount},1fr)`, gap: 12 }} className="grid4">
        {showPoultry && <Stat icon={Egg} label="Volailles en élevage" value={stats.poultryCount.toLocaleString("fr-FR")} sub="cheptel déclaré" accent={C.ochre} help="Nombre total de volailles/animaux que vous avez déclaré posséder, mis à jour depuis votre profil ferme." />}
        {showHectares && <Stat icon={Wheat} label="Surface cultivée" value={`${stats.hectares} ha`} sub="parcelles" accent={C.leaf} help="Surface agricole totale déclarée, en hectares, toutes cultures confondues." />}
        <Stat icon={TrendingUp} label="Saisies ce mois" value={stats.monthlyRecords} sub="activités enregistrées" accent={C.ochreDk} help="Nombre d'activités (alimentation, traitement, récolte…) enregistrées dans le registre digital depuis le 1er du mois." />
        <Stat icon={Bell} label="Alertes actives" value={stats.activeAlerts} sub={`${stats.urgentAlerts} urgentes`} accent={C.terra} help="Rappels non résolus (vaccins à faire, risques climatiques…). Les alertes urgentes demandent une action rapide." />
      </div>

      <div className="dash-2col" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14, marginTop: 14 }}>
        <div style={{ ...card, padding: 18 }}>
          <Row><H>Dernières saisies</H><button onClick={() => go("registre")} style={{ background: "none", border: "none", color: C.ochreDk, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>Enregistrer</button></Row>
          <div style={{ marginTop: 8 }}>
            {recentRecords.length === 0 && <div style={{ padding: "26px 0", textAlign: "center", color: "#6E9180", fontSize: 13.5 }}>Aucune activité pour l'instant.</div>}
            {recentRecords.map((r) => {
              const M = recIcon(r.type);
              return (
                <div key={r.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "9px 4px", borderBottom: `1px solid ${C.millet}` }}>
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

        <div style={{ ...card, padding: 18, display: "flex", flexDirection: "column" }}>
          <Row>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <H>Score Producteur</H>
              <HelpCircle size={14} color="#9CC4AC" style={{ cursor: "help" }} title="Note sur 100 qui combine vos pratiques de terrain, la régularité de vos saisies et votre santé financière. Un score élevé facilite l'accès au financement auprès des partenaires." />
            </div>
          </Row>
          <div style={{ display: "grid", placeItems: "center", flex: 1, padding: "8px 0" }}><ScoreRing score={stats.score} size={140} /></div>
          <button onClick={() => go("score")} style={ghostBtn}>Voir le détail <ChevronRight size={15} /></button>
        </div>
      </div>
    </Page>
  );
}
