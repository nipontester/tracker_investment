import React, { useState } from "react";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { requireSupabase } from "./supabaseClient.js";

const COPY = {
  en: {
    welcomeBack: "Welcome back",
    createAccount: "Create your account",
    loginSub: "Sign in to track your Dime! investments.",
    signupSub: "Set up your personal investment tracker.",
    email: "Email",
    password: "Password",
    passwordHint: "At least 6 characters",
    login: "Sign in",
    signup: "Create account",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    switchToSignup: "Sign up",
    switchToLogin: "Sign in",
    checkEmail: "Check your email to confirm your account, then sign in.",
    genericError: "Something went wrong. Please try again.",
  },
  th: {
    welcomeBack: "ยินดีต้อนรับกลับมา",
    createAccount: "สร้างบัญชีของคุณ",
    loginSub: "เข้าสู่ระบบเพื่อติดตามการลงทุนใน Dime! ของคุณ",
    signupSub: "ตั้งค่าตัวติดตามการลงทุนส่วนตัวของคุณ",
    email: "อีเมล",
    password: "รหัสผ่าน",
    passwordHint: "อย่างน้อย 6 ตัวอักษร",
    login: "เข้าสู่ระบบ",
    signup: "สร้างบัญชี",
    noAccount: "ยังไม่มีบัญชี?",
    haveAccount: "มีบัญชีอยู่แล้ว?",
    switchToSignup: "สมัครสมาชิก",
    switchToLogin: "เข้าสู่ระบบ",
    checkEmail: "ตรวจสอบอีเมลของคุณเพื่อยืนยันบัญชี แล้วเข้าสู่ระบบอีกครั้ง",
    genericError: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
  },
};

export default function Auth({ lang = "en" }) {
  const t = COPY[lang] || COPY.en;
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const supabase = requireSupabase();
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo(t.checkEmail);
      }
    } catch (err) {
      setError(err?.message || t.genericError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-brand">
          <div className="auth-mark">💰</div>
          <div className="auth-title">Dime!</div>
        </div>

        <h1>{mode === "login" ? t.welcomeBack : t.createAccount}</h1>
        <p className="auth-sub">{mode === "login" ? t.loginSub : t.signupSub}</p>

        <label className="auth-field">
          <span>{t.email}</span>
          <div className="auth-input-wrap">
            <Mail size={16} />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
        </label>

        <label className="auth-field">
          <span>{t.password}</span>
          <div className="auth-input-wrap">
            <Lock size={16} />
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {mode === "signup" && <span className="auth-hint">{t.passwordHint}</span>}
        </label>

        {error && (
          <div className="auth-error">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}
        {info && <div className="auth-info">{info}</div>}

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? <Loader2 size={16} className="auth-spin" /> : mode === "login" ? t.login : t.signup}
        </button>

        <div className="auth-switch">
          {mode === "login" ? t.noAccount : t.haveAccount}{" "}
          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === "login" ? "signup" : "login"));
              setError("");
              setInfo("");
            }}
          >
            {mode === "login" ? t.switchToSignup : t.switchToLogin}
          </button>
        </div>
      </form>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .auth-shell {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: #F8FAFC; padding: 24px; font-family: 'Inter', sans-serif;
        }
        .auth-card {
          width: 100%; max-width: 380px; background: #FFFFFF; border: 1px solid #E5E7EB;
          border-radius: 20px; padding: 32px 28px; box-shadow: 0 1px 2px rgba(15,23,42,0.04), 0 1px 6px -2px rgba(15,23,42,0.06);
        }
        .auth-brand { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
        .auth-mark { font-size: 24px; }
        .auth-title { font-size: 16px; font-weight: 800; color: #111827; }
        .auth-card h1 { font-size: 20px; font-weight: 800; color: #111827; margin: 0 0 4px; letter-spacing: -0.01em; }
        .auth-sub { font-size: 13px; color: #6B7280; margin: 0 0 24px; line-height: 1.5; }
        .auth-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .auth-field span:first-child { font-size: 12.5px; font-weight: 600; color: #6B7280; }
        .auth-input-wrap {
          display: flex; align-items: center; gap: 8px; border: 1px solid #E5E7EB; border-radius: 10px;
          padding: 0 12px; height: 42px; color: #9CA3AF; transition: border-color 0.15s, box-shadow 0.15s;
        }
        .auth-input-wrap:focus-within { border-color: #22C55E; box-shadow: 0 0 0 3px rgba(34,197,94,0.15); }
        .auth-input-wrap input {
          border: none; outline: none; flex: 1; font-size: 14px; color: #111827; font-family: inherit;
          background: transparent;
        }
        .auth-hint { font-size: 11px; color: #9CA3AF; }
        .auth-error {
          display: flex; align-items: center; gap: 6px; background: rgba(239,68,68,0.08); color: #B91C1C;
          font-size: 12.5px; padding: 10px 12px; border-radius: 10px; margin-bottom: 14px; line-height: 1.4;
        }
        .auth-info {
          background: rgba(34,197,94,0.08); color: #15803D; font-size: 12.5px; padding: 10px 12px;
          border-radius: 10px; margin-bottom: 14px; line-height: 1.4;
        }
        .auth-submit {
          width: 100%; height: 44px; border-radius: 10px; background: #22C55E; color: #fff; border: none;
          font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 14px -4px rgba(34,197,94,0.5); transition: background 0.15s;
        }
        .auth-submit:hover { background: #1ea854; }
        .auth-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .auth-spin { animation: auth-spin 0.8s linear infinite; }
        @keyframes auth-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .auth-switch { text-align: center; font-size: 13px; color: #6B7280; margin-top: 18px; }
        .auth-switch button {
          background: none; border: none; color: #22C55E; font-weight: 700; cursor: pointer;
          font-size: 13px; font-family: inherit; padding: 0;
        }
      `}</style>
    </div>
  );
}
