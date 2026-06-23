import React, { useEffect, useState } from "react";
import { Sprout, Gauge, ShieldCheck, Handshake, Search, MapPin, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { partnersApi } from "../api/index.js";
import { C, card, barColor, ZONE_LABELS } from "../styles/theme.js";
import { Page, Row, H, Tag, Stat, Spinner, ErrorBanner } from "../components/ui.js";

export default function PartenairesPage() {
  const [summary, setSummary] = useState(null);
  const [producers, setProducers] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([partnersApi.summary(), partnersApi.producers()])
      .then(([s, p]) => { setSummary(s); setProducers(p); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) return <Page title="Espace partenaires"><ErrorBanner message={error} /></Page>;
  if (loading || !summary) return <Page title="Espace partenaires"><Spinner /></Page>;

  const list = producers.filter((p) => p.fullName.toLowerCase().includes(q.toLowerCase()) || (ZONE_LABELS[p.zone] || "").toLowerCase().includes(q.toLowerCase()));
  const distrib = [
    { name: "Éligibles (≥70)", value: summary.eligible, fill: C.leaf },
    { name: "À suivre (<70)", value: summary.toMonitor, fill: C.ochre },
  ];

  return (
    <Page title="Espace partenaires" subtitle="Données agrégées des producteurs, scores et opportunités de financement.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }} className="grid4">
        <Stat icon={Sprout} label="Producteurs suivis" value={summary.total} sub="réseau Guinée" accent={C.leaf} />
        <Stat icon={Gauge} label="Score moyen" value={summary.avgScore} sub="/ 100" accent={C.ochre} />
        <Stat icon={ShieldCheck} label="Éligibles au crédit" value={summary.eligible} sub={`sur ${summary.total}`} accent={C.leafDk} />
        <Stat icon={Handshake} label="Prêts au financement" value={summary.financingReady} sub="score ≥ 84" accent={C.ochreDk} />
      </div>

      <div className="dash-2col" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, marginTop: 18 }}>
        <div style={{ ...card, padding: 20 }}>
          <Row>
            <H>Portefeuille producteurs</H>
            <div style={{ position: "relative" }}>
              <Search size={14} color="#9CC4AC" style={{ position: "absolute", left: 11, top: 9 }} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" style={{ padding: "7px 12px 7px 32px", borderRadius: 9, border: `1.5px solid ${C.line}`, fontSize: 13, outline: "none", width: 150, background: "#F6FBF8" }} />
            </div>
          </Row>
          <div style={{ marginTop: 12, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ textAlign: "left", color: "#6E9180", fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".04em" }}>
                <th style={th}>Producteur</th><th style={th}>Filière</th><th style={th}>Exploitation</th><th style={th}>Score</th><th style={th}>Statut</th>
              </tr></thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} style={{ borderTop: `1px solid ${C.millet}` }}>
                    <td style={td}><div style={{ fontWeight: 600, color: C.soil }}>{p.fullName}</div><div style={{ fontSize: 11.5, color: "#6E9180", display: "flex", alignItems: "center", gap: 3 }}><MapPin size={11} /> {ZONE_LABELS[p.zone]}</div></td>
                    <td style={td}>{p.farmType === "AVICOLE" ? "Avicole" : p.farmType === "AGRICOLE" ? "Agricole" : "Mixte"}</td>
                    <td style={td}>{p.poultryCount ? `${p.poultryCount} sujets` : ""}{p.poultryCount && p.hectares ? " · " : ""}{p.hectares ? `${p.hectares} ha` : ""}</td>
                    <td style={td}><span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 15, color: barColor(p.score) }}>{p.score}</span></td>
                    <td style={td}><Tag bg={p.eligible ? C.leaf + "1A" : C.ochre + "1A"} fg={p.eligible ? C.leafDk : C.ochreDk}>{p.statut}</Tag></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ ...card, padding: 20 }}>
            <H>Éligibilité du réseau</H>
            <div style={{ height: 160, marginTop: 8 }}>
              <ResponsiveContainer>
                <PieChart><Pie data={distrib} dataKey="value" innerRadius={42} outerRadius={66} paddingAngle={3}>{distrib.map((d, i) => <Cell key={i} fill={d.fill} />)}</Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 4 }}>
              {distrib.map((d) => (<div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#3A6B4D" }}><span style={{ width: 10, height: 10, borderRadius: 3, background: d.fill }} />{d.name} · <strong>{d.value}</strong></div>))}
            </div>
          </div>
          <div style={{ ...card, padding: 20, background: C.soil, color: "#fff" }}>
            <Handshake size={22} color={C.leaf} />
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, marginTop: 10 }}>Opportunité de financement</div>
            <p style={{ fontSize: 13, color: "#BFE0CC", marginTop: 8, lineHeight: 1.55 }}>{summary.financingReady} producteur{summary.financingReady > 1 ? "s" : ""} au score ≥ 84 — prêts pour un crédit d'extension. Lancez une offre groupée à taux préférentiel.</p>
            <button style={{ marginTop: 14, padding: "10px 16px", border: "none", borderRadius: 10, background: C.leaf, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>Préparer l'offre <ChevronRight size={15} /></button>
          </div>
        </div>
      </div>
    </Page>
  );
}

const th = { padding: "8px 8px", fontWeight: 600 };
const td = { padding: "12px 8px", color: "#3A6B4D", verticalAlign: "middle" };
