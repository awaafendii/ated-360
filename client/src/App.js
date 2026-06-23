import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import AuthPage from "./pages/AuthPage.js";
import AppShell from "./components/AppShell.js";
import { Spinner } from "./components/ui.js";

function Gate() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#fff" }}>
        <Spinner label="Chargement de votre espace…" />
      </div>
    );
  }
  return user ? <AppShell /> : <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
