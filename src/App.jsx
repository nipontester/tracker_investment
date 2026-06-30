import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "./useAuth.js";
import Auth from "./Auth.jsx";
import DimeTracker from "./DimeTracker.jsx";
import { supabaseConfig } from "./supabaseClient.js";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorScreen
          title="Something went wrong"
          message="The app hit an unexpected error while rendering. Reload the page, then check the browser console if it happens again."
        />
      );
    }

    return this.props.children;
  }
}

function ErrorScreen({ title, message, details }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F8FAFC",
        padding: 24,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: 16,
          padding: 28,
          boxShadow: "0 10px 30px -18px rgba(15,23,42,0.45)",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#B45309",
            background: "rgba(245,158,11,0.14)",
            marginBottom: 16,
          }}
        >
          <AlertTriangle size={22} />
        </div>
        <h1 style={{ margin: "0 0 8px", fontSize: 22, lineHeight: 1.2, color: "#111827" }}>
          {title}
        </h1>
        <p style={{ margin: 0, color: "#4B5563", fontSize: 14, lineHeight: 1.6 }}>
          {message}
        </p>
        {details && (
          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              borderRadius: 10,
              background: "#F9FAFB",
              color: "#6B7280",
              fontSize: 12.5,
              lineHeight: 1.5,
            }}
          >
            {details}
          </div>
        )}
      </div>
    </div>
  );
}

function ConfigErrorScreen({ message }) {
  const details = [
    `VITE_SUPABASE_URL: ${supabaseConfig.hasUrl ? supabaseConfig.urlHost || "set but invalid" : "missing"}`,
    `VITE_SUPABASE_ANON_KEY: ${supabaseConfig.hasAnonKey ? "set" : "missing"}`,
  ].join(" · ");

  return (
    <ErrorScreen
      title="Supabase is not configured"
      message={`${message} On Netlify, redeploy the site after changing environment variables because Vite reads them during the build.`}
      details={details}
    />
  );
}

function AppContent() {
  const { user, loading, signOut, configError } = useAuth();

  if (configError) {
    return <ConfigErrorScreen message={configError} />;
  }

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

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
