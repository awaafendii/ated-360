import React, { useState } from "react";
import { Egg, Sprout, Building2, ChevronRight, Lock, Bell, Award } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import { C, card, lblS, inpS, ZONES, ZONE_LABELS } from "../styles/theme.js";

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("PRODUCTEUR");
  const [form, setForm] = useState({ fullName: "", email: "", password: "", zone: "CONAKRY", farmType: "MIXTE" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setError(""); setBusy(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        const payload = { fullName: form.fullName, email: form.email, password: form.password, role, zone: form.zone };
        if (role === "PRODUCTEUR") { payload.farmType = form.farmType; }
        await register(payload);
      }
    } catch (err) {
      setError(err.message || "Échec de la connexion");
    } finally {
      setBusy(false);
    }
  };

  const roles = [
    { id: "PRODUCTEUR", label: "Producteur", Icon: Sprout, desc: "Gérer ma ferme au quotidien" },
    { id: "PARTENAIRE", label: "Partenaire", Icon: Building2, desc: "Banque, ONG, coopérative" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Inter', system-ui, sans-serif", display: "grid", placeItems: "center", padding: "40px 22px" }}>
      <div className="auth-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", maxWidth: 1000, width: "100%", ...card, overflow: "hidden", boxShadow: "0 24px 60px rgba(20,54,31,.14)" }}>
        <div style={{ background: C.soil, color: "#fff", padding: "44px 40px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -60, top: -60, width: 220, height: 220, borderRadius: "50%", background: C.ochre, opacity: .18 }} />
          <div style={{ position: "absolute", right: 30, bottom: -40, width: 160, height: 160, borderRadius: "50%", background: C.leaf, opacity: .2 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: C.ochre, display: "grid", placeItems: "center" }}><Egg size={20} color="#fff" /></span>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600 }}>ATED‑360</span>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 33, lineHeight: 1.12, margin: "34px 0 14px", position: "relative" }}>La ferme guinéenne,<br />pilotée par la donnée.</h1>
          <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "#BFE0CC", maxWidth: 330, position: "relative" }}>De Conakry à Nzérékoré : enregistrez vos activités, anticipez vaccinations et risques climatiques, et construisez un score qui ouvre l'accès au financement.</p>
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>
            {[[Egg, "Suivi avicole & agricole unifié"], [Bell, "Alertes vaccinales & climatiques"], [Award, "Score reconnu par les partenaires"]].map(([Ic, t], i) => (
              <div key={i} style={{ display: "flex", gap: 11, alignItems: "center", fontSize: 13.5, color: "#D6ECDE" }}><Ic size={17} color={C.leaf} /> {t}</div>
            ))}
          </div>
        </div>

        <div style={{ padding: "42px 36px", background: "#fff" }}>
          <div style={{ display: "flex", gap: 4, background: C.millet, padding: 4, borderRadius: 11, marginBottom: 24 }}>
            {["login", "signup"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13.5, background: mode === m ? "#fff" : "transparent", color: mode === m ? C.soil : "#6E9180", boxShadow: mode === m ? "0 1px 3px rgba(20,54,31,.1)" : "none" }}>{m === "login" ? "Connexion" : "Inscription"}</button>
            ))}
          </div>

          {error && <div style={{ background: "#FBE7E1", color: C.terra, fontSize: 13, fontWeight: 600, padding: "10px 13px", borderRadius: 10, marginBottom: 14 }}>{error}</div>}

          {mode === "signup" && (
            <>
              <label style={lblS}>Je suis…</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                {roles.map((r) => {
                  const on = role === r.id;
                  return (
                    <button key={r.id} onClick={() => setRole(r.id)} style={{ textAlign: "left", padding: 14, borderRadius: 12, cursor: "pointer", border: `1.5px solid ${on ? C.ochre : C.line}`, background: on ? C.ochre + "12" : "#fff" }}>
                      <r.Icon size={20} color={on ? C.ochreDk : "#6E9180"} />
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: C.soil, marginTop: 8 }}>{r.label}</div>
                      <div style={{ fontSize: 11.5, color: "#6E9180", marginTop: 2 }}>{r.desc}</div>
                    </button>
                  );
                })}
              </div>
              <label style={lblS}>Nom et prénoms</label>
              <input value={form.fullName} onChange={set("fullName")} placeholder="Mariama Baldé" style={inpS} />
              <label style={lblS}>Ville (Guinée)</label>
              <select value={form.zone} onChange={set("zone")} style={inpS}>
                {ZONES.map((z) => <option key={z} value={z}>{ZONE_LABELS[z]}</option>)}
              </select>
              {role === "PRODUCTEUR" && (
                <>
                  <label style={lblS}>Type de ferme</label>
                  <select value={form.farmType} onChange={set("farmType")} style={inpS}>
                    <option value="AVICOLE">Avicole</option>
                    <option value="AGRICOLE">Agricole</option>
                    <option value="MIXTE">Mixte</option>
                  </select>
                </>
              )}
            </>
          )}

          <label style={lblS}>E‑mail</label>
          <input value={form.email} onChange={set("email")} placeholder="exemple@ferme.gn" style={inpS} />
          <label style={lblS}>Mot de passe</label>
          <div style={{ position: "relative" }}>
            <input type="password" value={form.password} onChange={set("password")} placeholder="••••••••" style={inpS}
              onKeyDown={(e) => e.key === "Enter" && submit()} />
            <Lock size={15} color="#9CC4AC" style={{ position: "absolute", right: 14, top: 13 }} />
          </div>

          <button onClick={submit} disabled={busy} style={{ width: "100%", marginTop: 20, padding: "13px 0", border: "none", borderRadius: 12, background: busy ? "#9CC4AC" : C.ochre, color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: busy ? "default" : "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
            {busy ? "Veuillez patienter…" : mode === "login" ? "Se connecter" : "Créer mon compte"} {!busy && <ChevronRight size={17} />}
          </button>

          {mode === "login" && (
            <p style={{ fontSize: 11.5, color: "#6E9180", textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>
              Démo — Producteur : mariama@ferme.gn · Partenaire : partenaire@credit.gn<br />Mot de passe : Password123
            </p>
          )}
        </div>
      </div>
      <style>{`@media (max-width: 760px){ .auth-grid{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}
