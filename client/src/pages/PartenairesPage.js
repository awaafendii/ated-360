import React, { useEffect, useState, useCallback } from "react";
import { Sprout, Gauge, ShieldCheck, Handshake, Search, MapPin, ChevronRight, X, Send, Wheat, Syringe, Pill, TrendingUp, FileText, Image, Video, File as FileIcon } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { partnersApi } from "../api/index.js";
import { C, card, lblS, inpS, barColor, fmtDate, ZONE_LABELS } from "../styles/theme.js";
import { Page, Row, H, Tag, Stat, Spinner, ErrorBanner } from "../components/ui.js";

const recIcon = (t) => ({ ALIMENTATION: Wheat, VACCINATION: Syringe, TRAITEMENT: Pill, RENDEMENT: TrendingUp }[t] || TrendingUp);
const recLabel = (t) => ({ ALIMENTATION: "Alimentation", VACCINATION: "Vaccination", TRAITEMENT: "Traitement", RENDEMENT: "Rendement" }[t] || t);
const hasStructureInfo = (s) => !!s && Object.values(s).some((v) => v !== null && v !== undefined && v !== "");

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,54,31,.45)", zIndex: 1000, display: "grid", placeItems: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 620, maxHeight: "85vh", overflow: "auto", padding: "28px 30px", position: "relative", boxShadow: "0 20px 60px rgba(20,54,31,.2)" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={20} color="#6E9180" /></button>
        {children}
      </div>
    </div>
  );
}

function OfferForm({ producer, onClose }) {
  const [form, setForm] = useState({ message: "", amount: "", phone: "", email: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    if (!form.message.trim()) return setError("Veuillez saisir un message.");
    setSending(true); setError("");
    try {
      await partnersApi.sendOffer({
        producerId: producer.id,
        partnerName: "Partenaire ATED-360",
        message: form.message,
        amount: form.amount || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
      });
      setSent(true);
    } catch (err) {
      setError(err.message || "Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  if (sent) return (
    <div style={{ textAlign: "center", padding: "30px 0" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.leaf + "1A", display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Send size={24} color={C.leaf} /></div>
      <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: C.soil, margin: "0 0 8px" }}>Offre envoyée !</h3>
      <p style={{ color: "#6E9180", fontSize: 13.5 }}>Votre proposition pour <strong>{producer.fullName}</strong> a été transmise avec succès.</p>
      <button onClick={onClose} style={{ marginTop: 18, padding: "10px 28px", border: "none", borderRadius: 10, background: C.ochre, color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>Fermer</button>
    </div>
  );

  return (
    <div>
      <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 19, color: C.soil, margin: "0 0 4px" }}>Faire une offre</h3>
      <p style={{ color: "#6E9180", fontSize: 13, margin: "0 0 18px" }}>Proposition pour <strong>{producer.fullName}</strong> — {ZONE_LABELS[producer.zone]}</p>
      {error && <div style={{ background: "#FBE7E1", color: C.terra, fontSize: 13, fontWeight: 600, padding: "9px 12px", borderRadius: 9, marginBottom: 12 }}>{error}</div>}
      <label style={lblS}>Votre message *</label>
      <textarea value={form.message} onChange={set("message")} rows={3} placeholder="Décrivez votre proposition de financement ou partenariat…" style={{ ...inpS, resize: "vertical", minHeight: 70 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div><label style={lblS}>Montant proposé (GNF)</label><input value={form.amount} onChange={set("amount")} placeholder="Ex: 5 000 000 GNF" style={inpS} /></div>
        <div><label style={lblS}>Votre téléphone</label><input value={form.phone} onChange={set("phone")} placeholder="+224 6XX XX XX XX" style={inpS} /></div>
      </div>
      <label style={lblS}>Votre e-mail</label>
      <input value={form.email} onChange={set("email")} placeholder="contact@partenaire.gn" style={inpS} />
      <button onClick={submit} disabled={sending} style={{ width: "100%", marginTop: 8, padding: "12px 0", border: "none", borderRadius: 11, background: sending ? "#9CC4AC" : C.ochre, color: "#fff", fontWeight: 700, fontSize: 14, cursor: sending ? "default" : "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
        {sending ? "Envoi en cours…" : "Envoyer l'offre"} {!sending && <Send size={15} />}
      </button>
    </div>
  );
}

function ProducerDetail({ producer, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showOffer, setShowOffer] = useState(false);

  useEffect(() => {
    partnersApi.producerDetail(producer.id)
      .then(setDetail)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [producer.id]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;

  if (showOffer) return <OfferForm producer={detail} onClose={onClose} />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 21, color: C.soil, margin: "0 0 4px" }}>{detail.fullName}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6E9180" }}>
            <MapPin size={13} /> {ZONE_LABELS[detail.zone]} — {detail.farmType === "AVICOLE" ? "Avicole" : detail.farmType === "AGRICOLE" ? "Agricole" : "Mixte"}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 600, color: barColor(detail.score.global) }}>{detail.score.global}</div>
          <div style={{ fontSize: 11, color: "#6E9180", fontWeight: 600 }}>SCORE</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
        {detail.poultryCount > 0 && <div style={{ ...card, padding: 12, textAlign: "center" }}><div style={{ fontSize: 11, color: "#6E9180", fontWeight: 600 }}>Sujets</div><div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, color: C.soil }}>{detail.poultryCount}</div></div>}
        {detail.hectares > 0 && <div style={{ ...card, padding: 12, textAlign: "center" }}><div style={{ fontSize: 11, color: "#6E9180", fontWeight: 600 }}>Hectares</div><div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, color: C.soil }}>{detail.hectares}</div></div>}
        <div style={{ ...card, padding: 12, textAlign: "center" }}><div style={{ fontSize: 11, color: "#6E9180", fontWeight: 600 }}>Activités</div><div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, color: C.soil }}>{detail.records.length}</div></div>
      </div>

      {detail.fieldLocation && (
        <div style={{ fontSize: 12.5, color: "#6E9180", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}><MapPin size={12} /> {detail.fieldLocation}</div>
      )}
      {detail.cultures && detail.cultures.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: "#6E9180", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".03em", marginBottom: 7 }}>Cultures déclarées</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {detail.cultures.map((c) => <Tag key={c} bg={C.leaf + "1A"} fg={C.leafDk}>{c}</Tag>)}
          </div>
        </div>
      )}

      {(detail.cvUrl || hasStructureInfo(detail.structure) || (detail.proofs && detail.proofs.length > 0)) && (
        <div style={{ ...card, padding: 16, marginBottom: 18, background: "#FAFDFB" }}>
          <div style={{ fontSize: 11, color: "#6E9180", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".03em", marginBottom: 10 }}>Dossier producteur</div>

          {detail.cvUrl && (
            <a href={detail.cvUrl} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: C.ochreDk, textDecoration: "underline", marginBottom: 10 }}>
              <FileText size={14} /> Voir le CV
            </a>
          )}

          {hasStructureInfo(detail.structure) && (
            <div style={{ fontSize: 12.5, color: "#3A6B4D", lineHeight: 1.7, marginBottom: detail.proofs?.length ? 12 : 0 }}>
              {detail.structure.startYear && <div>Activité depuis <strong style={{ color: C.soil }}>{detail.structure.startYear}</strong></div>}
              {detail.structure.legalStatus && <div>Statut : <strong style={{ color: C.soil }}>{detail.structure.legalStatus}</strong></div>}
              {detail.structure.investedAmount && <div>Montants investis : <strong style={{ color: C.soil }}>{detail.structure.investedAmount}</strong></div>}
              {detail.structure.annualRevenue && <div>Chiffre d'affaires annuel : <strong style={{ color: C.soil }}>{detail.structure.annualRevenue}</strong></div>}
              {(detail.structure.youthEmployed || detail.structure.womenEmployed) && (
                <div>Emplois créés : {detail.structure.youthEmployed ? `${detail.structure.youthEmployed} jeunes` : ""}{detail.structure.youthEmployed && detail.structure.womenEmployed ? " · " : ""}{detail.structure.womenEmployed ? `${detail.structure.womenEmployed} femmes` : ""}</div>
              )}
              {detail.structure.achievements && <div style={{ marginTop: 6 }}><strong style={{ color: C.soil }}>Réussites :</strong> {detail.structure.achievements}</div>}
              {detail.structure.challenges && <div><strong style={{ color: C.soil }}>Difficultés :</strong> {detail.structure.challenges}</div>}
              {detail.structure.outlook && <div><strong style={{ color: C.soil }}>Perspectives :</strong> {detail.structure.outlook}</div>}
            </div>
          )}

          {detail.proofs && detail.proofs.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {detail.proofs.map((p) => {
                const Ic = p.type === "PHOTO" ? Image : p.type === "VIDEO" ? Video : FileIcon;
                return (
                  <a key={p.id} href={p.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: C.leafDk, background: C.leaf + "1A", padding: "4px 9px", borderRadius: 999, textDecoration: "none" }}>
                    <Ic size={12} /> {p.label || p.type}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}

      <H>Historique de production</H>
      <div style={{ marginTop: 10, maxHeight: 260, overflow: "auto" }}>
        {detail.records.length === 0 ? (
          <p style={{ color: "#6E9180", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Aucune activité enregistrée.</p>
        ) : (
          detail.records.map((r) => {
            const Icon = recIcon(r.type);
            return (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.millet}` }}>
                <span style={{ width: 34, height: 34, borderRadius: 9, background: C.ochre + "14", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={16} color={C.ochreDk} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.soil, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.detail}</div>
                  <div style={{ fontSize: 11.5, color: "#6E9180" }}>{recLabel(r.type)}{r.quantity ? ` — ${r.quantity}` : ""}</div>
                </div>
                <div style={{ fontSize: 12, color: "#6E9180", flexShrink: 0 }}>{fmtDate(r.occurredAt)}</div>
              </div>
            );
          })
        )}
      </div>

      <button onClick={() => setShowOffer(true)} style={{ width: "100%", marginTop: 18, padding: "12px 0", border: "none", borderRadius: 11, background: C.ochre, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
        Faire une offre <Handshake size={16} />
      </button>
    </div>
  );
}

export default function PartenairesPage() {
  const [summary, setSummary] = useState(null);
  const [producers, setProducers] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

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
        <Stat icon={Sprout} label="Producteurs suivis" value={summary.total} sub="réseau Guinée" accent={C.leaf} help="Nombre total de comptes producteurs inscrits sur la plateforme." />
        <Stat icon={Gauge} label="Score moyen" value={summary.avgScore} sub="/ 100" accent={C.ochre} help="Moyenne des scores (sur 100) de l'ensemble des producteurs suivis, tous volets confondus." />
        <Stat icon={ShieldCheck} label="Éligibles au crédit" value={summary.eligible} sub={`sur ${summary.total}`} accent={C.leafDk} help="Producteurs dont le score est ≥ 70, considérés comme présentant un profil suffisamment solide pour un financement." />
        <Stat icon={Handshake} label="Prêts au financement" value={summary.financingReady} sub="score ≥ 84" accent={C.ochreDk} help="Producteurs au profil le plus solide (score ≥ 84), prêts à recevoir une offre de financement." />
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
                  <tr key={p.id} style={{ borderTop: `1px solid ${C.millet}`, cursor: "pointer", transition: "background .15s" }} onClick={() => setSelected(p)} onMouseEnter={(e) => e.currentTarget.style.background = C.millet} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={td}><div style={{ fontWeight: 600, color: C.ochre, textDecoration: "underline", cursor: "pointer" }}>{p.fullName}</div><div style={{ fontSize: 11.5, color: "#6E9180", display: "flex", alignItems: "center", gap: 3 }}><MapPin size={11} /> {ZONE_LABELS[p.zone]}</div></td>
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
            <p style={{ fontSize: 13, color: "#BFE0CC", marginTop: 8, lineHeight: 1.55 }}>{summary.financingReady} producteur{summary.financingReady > 1 ? "s" : ""} au score ≥ 84 — prêts pour un crédit d'extension. Cliquez sur un producteur pour voir son historique et lui faire une offre.</p>
          </div>
        </div>
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)}>
        {selected && <ProducerDetail producer={selected} onClose={() => setSelected(null)} />}
      </Modal>
    </Page>
  );
}

const th = { padding: "8px 8px", fontWeight: 600 };
const td = { padding: "12px 8px", color: "#3A6B4D", verticalAlign: "middle" };
