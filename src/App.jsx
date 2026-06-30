import React from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "./useAuth.js";
import Auth from "./Auth.jsx";
import DimeTracker from "./DimeTracker.jsx";

export default function App() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F8FAFC",
        }}
      >
        <Loader2 size={28} color="#22C55E" style={{ animation: "app-spin 0.8s linear infinite" }} />
        <style>{`@keyframes app-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return <DimeTracker user={user} onSignOut={signOut} />;
}
