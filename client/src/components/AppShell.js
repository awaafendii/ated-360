import React, { useState } from "react";
import {
  LayoutDashboard, ClipboardList, Plane, Bell, Gauge, LogOut, Egg, Menu, X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import { C } from "../styles/theme.js";
import DashboardPage from "../pages/DashboardPage.js";
import RegistrePage from "../pages/RegistrePage.js";
import DronesPage from "../pages/DronesPage.js";
import AlertesPage from "../pages/AlertesPage.js";
import ScorePage from "../pages/ScorePage.js";
import PartenairesPage from "../pages/PartenairesPage.js";

export default function AppShell() {
  const { user, logout } = useAuth();
  const isProd = user.role === "PRODUCTEUR";
  const [tab, setTab] = useState(isProd ? "dashboard" : "partenaires");
  const [mobileNav, setMobileNav] = useState(false);

  const nav = isProd
    ? [["dashboard", "Tableau de bord", LayoutDashboard], ["registre", "Registre digital", ClipboardList], ["drones", "Drones & champs", Plane], ["alertes", "Alertes", Bell], ["score", "Mon score", Gauge]]
    : [["partenaires", "Producteurs", LayoutDashboard]];

  const render = () => {
    switch (tab) {
      case "dashboard": return <DashboardPage go={setTab} />;
      case "registre": return <RegistrePage />;
      case "drones": return <DronesPage />;
      case "alertes": return <AlertesPage />;
      case "score": return <ScorePage />;
      case "partenaires": return <PartenairesPage />;
      default: return null;
    }
  };

  const NavLinks = ({ onPick }) => (
    <>
      {nav.map(([id, label, Ic]) => {
        const on = tab === id;
        return (
          <button key={id} onClick={() => { setTab(id); onPick && onPick(); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", borderRadius: 11, border: "none", cursor: "pointer", textAlign: "left", fontSize: 14, fontWeight: 600, background: on ? C.ochre : "transparent", color: on ? "#fff" : "#9CC4AC" }}>
            <Ic size={18} /> {label}
          </button>
        );
      })}
    </>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F4FAF6", display: "flex", fontFamily: "'Inter', system-ui, sans-serif", color: C.soil }}>
      <aside className="ated-side" style={{ width: 248, background: C.soil, color: "#fff", padding: "22px 16px", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px 22px" }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: C.ochre, display: "grid", placeItems: "center" }}><Egg size={19} color="#fff" /></span>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600 }}>ATED‑360</span>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}><NavLinks /></nav>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.12)", paddingTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 6px 12px" }}>
            <span style={{ width: 36, height: 36, borderRadius: "50%", background: C.leaf, display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>{user.fullName.charAt(0)}</span>
            <div style={{ minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.fullName}</div><div style={{ fontSize: 11, color: "#9CC4AC", textTransform: "capitalize" }}>{user.role.toLowerCase()}</div></div>
          </div>
          <button onClick={logout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 13px", borderRadius: 10, border: "none", background: "rgba(255,255,255,.06)", color: "#9CC4AC", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}><LogOut size={16} /> Se déconnecter</button>
        </div>
      </aside>

      {mobileNav && <div onClick={() => setMobileNav(false)} style={{ position: "fixed", inset: 0, background: "rgba(20,54,31,.5)", zIndex: 40 }} />}
      <aside style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 248, background: C.soil, color: "#fff", padding: "22px 16px", zIndex: 50, transform: mobileNav ? "translateX(0)" : "translateX(-100%)", transition: "transform .25s", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 6px 22px" }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600 }}>ATED‑360</span>
          <button onClick={() => setMobileNav(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={20} /></button>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}><NavLinks onPick={() => setMobileNav(false)} /></nav>
      </aside>

      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header className="ated-top" style={{ display: "none", alignItems: "center", gap: 12, padding: "14px 18px", background: "#fff", borderBottom: `1px solid ${C.line}`, position: "sticky", top: 0, zIndex: 30 }}>
          <button onClick={() => setMobileNav(true)} style={{ background: "none", border: "none", cursor: "pointer", color: C.soil }}><Menu size={22} /></button>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600 }}>ATED‑360</span>
        </header>
        <div style={{ padding: "26px clamp(16px,4vw,34px)", flex: 1 }}>{render()}</div>
      </main>

      <style>{`
        *{ box-sizing:border-box; }
        button:focus-visible, input:focus-visible, select:focus-visible{ outline:2px solid ${C.ochre}; outline-offset:2px; }
        @media (max-width: 920px){ .dash-2col{ grid-template-columns:1fr !important; } .grid4{ grid-template-columns:repeat(2,1fr) !important; } }
        @media (max-width: 820px){ .ated-side{ display:none !important; } .ated-top{ display:flex !important; } .grid3{ grid-template-columns:1fr !important; } }
        @media (max-width: 560px){ .grid4{ grid-template-columns:1fr !important; } }
      `}</style>
    </div>
  );
}
