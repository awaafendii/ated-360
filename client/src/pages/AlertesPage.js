import React, { useEffect, useState, useCallback } from "react";
import { AlertTriangle, CalendarClock, Info, Syringe, CloudRain, Pill, Check } from "lucide-react";
import { alertsApi } from "../api/index.js";
import { C, card, fmtDate, prioStyle, PRIORITY_FROM_API, KIND_FROM_API } from "../styles/theme.js";
import { Page, Row, H, Tag, Spinner, ErrorBanner } from "../components/ui.js";

const prioIcon = { urgent: AlertTriangle, normal: CalendarClock, info: Info };
const kindIcon = { vaccin: Syringe, climat: CloudRain, traitement: Pill };

export default function AlertesPage() {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({ urgent: 0, normal: 0, info: 0 });
  const [f, setF] = useState("Toutes");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = { resolved: "false" };
      if (f !== "Toutes") params.priority = f;
      const [list, sum] = await Promise.all([alertsApi.list(params), alertsApi.summary()]);
      setAlerts(list); setSummary(sum);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [f]);

  useEffect(() => { load(); }, [load]);

  const resolve = async (id) => {
    try { await alertsApi.resolve(id); await load(); } catch (e) { setError(e.message); }
  };

  const opts = [["Toutes", "Toutes"], ["URGENT", "Urgent"], ["NORMAL", "Normal"], ["INFO", "Info"]];

  return (
    <Page title="Centre d'alertes" subtitle="Vaccinations, traitements et risques climatiques à anticiper.">
      <ErrorBanner message={error} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }} className="grid3">
        {["urgent", "normal", "info"].map((k) => {
          const p = prioStyle[k]; const Ic = prioIcon[k];
          return (
            <div key={k} style={{ ...card, padding: 18, display: "flex", gap: 13, alignItems: "center" }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: p.bg, display: "grid", placeItems: "center" }}><Ic size={21} color={p.fg} /></span>
              <div><div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 600, color: C.soil }}>{summary[k]}</div><div style={{ fontSize: 12.5, color: "#6E9180" }}>{k === "info" ? "Informations" : p.label + "es"}</div></div>
            </div>
          );
        })}
      </div>

      <div style={{ ...card, padding: 20, marginTop: 18 }}>
        <Row>
          <H>Liste des alertes</H>
          <div style={{ display: "flex", gap: 6 }}>
            {opts.map(([val, lbl]) => (<button key={val} onClick={() => setF(val)} style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 999, cursor: "pointer", border: "none", background: f === val ? C.soil : C.millet, color: f === val ? "#fff" : "#3A6B4D" }}>{lbl}</button>))}
          </div>
        </Row>
        <div style={{ marginTop: 14 }}>
          {loading ? <Spinner /> : alerts.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "#6E9180", fontSize: 13.5 }}>Aucune alerte active. Tout est à jour.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {alerts.map((a) => {
                const prio = PRIORITY_FROM_API[a.priority]; const p = prioStyle[prio]; const K = kindIcon[KIND_FROM_API[a.kind]];
                return (
                  <div key={a.id} style={{ display: "flex", gap: 14, padding: 15, borderRadius: 14, border: `1px solid ${C.line}`, borderLeft: `4px solid ${p.fg}`, background: prio === "urgent" ? p.bg + "55" : "#fff" }}>
                    <span style={{ width: 42, height: 42, borderRadius: 11, background: p.bg, display: "grid", placeItems: "center", flexShrink: 0 }}><K size={19} color={p.fg} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}><span style={{ fontWeight: 700, fontSize: 14.5, color: C.soil }}>{a.title}</span><Tag bg={p.bg} fg={p.fg}>{p.label}</Tag></div>
                      <div style={{ fontSize: 13, color: "#3A6B4D", marginTop: 4 }}>{a.description}</div>
                      {a.dueAt && <div style={{ fontSize: 12, color: "#6E9180", marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}><CalendarClock size={13} /> Échéance : {fmtDate(a.dueAt)}</div>}
                    </div>
                    <button onClick={() => resolve(a.id)} title="Marquer comme traitée" style={{ alignSelf: "center", display: "flex", alignItems: "center", gap: 5, padding: "7px 11px", borderRadius: 9, border: `1.5px solid ${C.line}`, background: "#fff", color: C.leafDk, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}><Check size={14} /> Traiter</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
