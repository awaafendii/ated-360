import React from "react";
import { HelpCircle } from "lucide-react";
import { C, card, barColor } from "../styles/theme.js";
import { ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";

export const Tag = ({ children, bg, fg }) => (
  <span style={{ background: bg, color: fg, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999, letterSpacing: ".02em", textTransform: "uppercase" }}>{children}</span>
);

export const Row = ({ children }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>{children}</div>
);

export const H = ({ children }) => (
  <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 600, color: C.soil, margin: 0 }}>{children}</h3>
);

export function Page({ title, subtitle, children }) {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 23, fontWeight: 600, color: C.soil, margin: 0 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 13, color: "#6E9180", margin: "4px 0 0" }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function Stat({ icon: Icon, label, value, sub, accent, help }) {
  return (
    <div style={{ ...card, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6E9180", fontWeight: 600 }}>
          {label}
          {help && <HelpCircle size={13} color="#9CC4AC" style={{ cursor: "help" }} title={help} />}
        </span>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: accent + "1A", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={15} color={accent} /></span>
      </div>
      <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 25, fontWeight: 600, color: C.soil, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: "#6E9180" }}>{sub}</div>}
    </div>
  );
}

export function ScoreRing({ score, size = 150 }) {
  const data = [{ name: "s", value: score, fill: C.ochre }];
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="74%" outerRadius="100%" data={data} startAngle={90} endAngle={90 - (score / 100) * 360}>
          <RadialBar background={{ fill: C.millet }} dataKey="value" cornerRadius={20} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: size * 0.27, fontWeight: 600, color: C.soil, lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: 11, color: "#6E9180", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em" }}>/ 100</div>
        </div>
      </div>
    </div>
  );
}

export function Spinner({ label = "Chargement…" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "60px 0", color: "#6E9180" }}>
      <div style={{ width: 34, height: 34, borderRadius: "50%", border: `3px solid ${C.millet}`, borderTopColor: C.ochre, animation: "spin 0.8s linear infinite" }} />
      <span style={{ fontSize: 13.5 }}>{label}</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{ ...card, padding: "12px 15px", marginBottom: 14, background: "#FBE7E1", border: `1px solid ${C.terra}55`, color: C.terra, fontSize: 13.5, fontWeight: 600 }}>
      {message}
    </div>
  );
}

export const ghostBtn = { width: "100%", padding: "10px 0", borderRadius: 10, border: `1.5px solid ${C.line}`, background: "#fff", color: C.soil, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 4 };
export const primaryBtn = { width: "100%", padding: "12px 0", border: "none", borderRadius: 11, background: C.ochre, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", justifyContent: "center", gap: 8, alignItems: "center" };
export { barColor };
