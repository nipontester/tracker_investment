import React, { useEffect, useState } from "react";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { requireSupabase } from "./supabaseClient.js";

const COPY = {
  en: {
    welcomeBack: "Welcome back",
    createAccount: "Create your account",
    resetPassword: "Reset your password",
    forgotPassword: "Forgot your password?",
    loginSub: "Sign in to track your Dime! investments.",
    signupSub: "Set up your personal investment tracker.",
    forgotSub: "Enter your email and we'll send you a password reset link.",
    resetSub: "Choose a new password for your account.",
    email: "Email",
    password: "Password",
    newPassword: "New password",
    confirmPassword: "Confirm password",
    passwordHint: "At least 6 characters",
    login: "Sign in",
    signup: "Create account",
    sendResetLink: "Send reset link",
    updatePassword: "Update password",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    rememberPassword: "Remember your password?",
    switchToSignup: "Sign up",
    switchToLogin: "Sign in",
    checkEmail: "Check your email to confirm your account, then sign in.",
    resetEmailSent: "Check your email for a password reset link.",
    resetSuccess: "Password updated. Please sign in with your new password.",
    passwordMismatch: "Passwords don't match.",
    passwordTooShort: "Password must be at least 6 characters.",
    genericError: "Something went wrong. Please try again.",
  },
  th: {
    welcomeBack: "ยินดีต้อนรับกลับมา",
    createAccount: "สร้างบัญชีของคุณ",
    resetPassword: "ตั้งรหัสผ่านใหม่",
    forgotPassword: "ลืมรหัสผ่าน?",
    loginSub: "เข้าสู่ระบบเพื่อติดตามการลงทุนใน Dime! ของคุณ",
    signupSub: "ตั้งค่าตัวติดตามการลงทุนส่วนตัวของคุณ",
    forgotSub: "กรอกอีเมล แล้วเราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้คุณ",
    resetSub: "ตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ",
    email: "อีเมล",
    password: "รหัสผ่าน",
    newPassword: "รหัสผ่านใหม่",
    confirmPassword: "ยืนยันรหัสผ่านใหม่",
    passwordHint: "อย่างน้อย 6 ตัวอักษร",
    login: "เข้าสู่ระบบ",
    signup: "สร้างบัญชี",
    sendResetLink: "ส่งลิงก์ตั้งรหัสผ่าน",
    updatePassword: "บันทึกรหัสผ่านใหม่",
    noAccount: "ยังไม่มีบัญชี?",
    haveAccount: "มีบัญชีอยู่แล้ว?",
    rememberPassword: "จำรหัสผ่านได้แล้ว?",
    switchToSignup: "สมัครสมาชิก",
    switchToLogin: "เข้าสู่ระบบ",
    checkEmail: "ตรวจสอบอีเมลของคุณเพื่อยืนยันบัญชี แล้วเข้าสู่ระบบอีกครั้ง",
    resetEmailSent: "ตรวจสอบอีเมลของคุณสำหรับลิงก์ตั้งรหัสผ่านใหม่",
    resetSuccess: "เปลี่ยนรหัสผ่านแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่",
    passwordMismatch: "รหัสผ่านทั้งสองช่องไม่ตรงกัน",
    passwordTooShort: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
    genericError: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
  },
};

const browserLang =
  typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("th")
    ? "th"
    : "en";

export default function Auth({
  lang = browserLang,
  initialMode = "login",
  initialInfo = "",
  onInfoConsumed,
  onResetComplete,
}) {
  const t = COPY[lang] || COPY.en;
  const [mode, setMode] = useState(initialMode); // "login" | "signup" | "forgot" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState(initialInfo);

  useEffect(() => {
    setMode(initialMode);
    setPassword("");
    setConfirmPassword("");
    setError("");
  }, [initialMode]);

  useEffect(() => {
    if (!initialInfo) return;
    setInfo(initialInfo);
    onInfoConsumed?.();
  }, [initialInfo, onInfoConsumed]);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setPassword("");
    setConfirmPassword("");
    setError("");
    setInfo("");
  };

  const returnToLogin = async () => {
    if (mode === "reset") {
      try {
        await requireSupabase().auth.signOut();
      } catch {
        // Ignore sign-out failures here; the login screen can still recover.
      }
      onResetComplete?.("");
    }
    switchMode("login");
  };

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
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo(t.checkEmail);
      } else if (mode === "forgot") {
        const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) throw error;
        setInfo(t.resetEmailSent);
      } else if (mode === "reset") {
        if (password.length < 6) throw new Error(t.passwordTooShort);
        if (password !== confirmPassword) throw new Error(t.passwordMismatch);
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setPassword("");
        setConfirmPassword("");
        setMode("login");
        setInfo(t.resetSuccess);
        await supabase.auth.signOut();
        onResetComplete?.(t.resetSuccess);
      }
    } catch (err) {
      setError(err?.message || t.genericError);
    } finally {
      setLoading(false);
    }
  };

  const title = {
    login: t.welcomeBack,
    signup: t.createAccount,
    forgot: t.forgotPassword,
    reset: t.resetPassword,
  }[mode];
  const subtitle = {
    login: t.loginSub,
    signup: t.signupSub,
    forgot: t.forgotSub,
    reset: t.resetSub,
  }[mode];
  const submitLabel = {
    login: t.login,
    signup: t.signup,
    forgot: t.sendResetLink,
    reset: t.updatePassword,
  }[mode];

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-brand">
          <div className="auth-mark">💰</div>
          <div className="auth-title">Dime!</div>
        </div>

        <h1>{title}</h1>
        <p className="auth-sub">{subtitle}</p>

        {mode !== "reset" && (
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
        )}

        {mode !== "forgot" && (
          <label className="auth-field">
            <span>{mode === "reset" ? t.newPassword : t.password}</span>
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
            {(mode === "signup" || mode === "reset") && <span className="auth-hint">{t.passwordHint}</span>}
          </label>
        )}

        {mode === "reset" && (
          <label className="auth-field">
            <span>{t.confirmPassword}</span>
            <div className="auth-input-wrap">
              <Lock size={16} />
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </label>
        )}

        {error && (
          <div className="auth-error">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}
        {info && <div className="auth-info">{info}</div>}

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? <Loader2 size={16} className="auth-spin" /> : submitLabel}
        </button>

        {mode === "login" && (
          <div className="auth-forgot">
            <button type="button" onClick={() => switchMode("forgot")}>
              {t.forgotPassword}
            </button>
          </div>
        )}

        <div className="auth-switch">
          {mode === "login" ? t.noAccount : mode === "signup" ? t.haveAccount : t.rememberPassword}{" "}
          <button
            type="button"
            onClick={() => {
              if (mode === "login") switchMode("signup");
              else returnToLogin();
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
        .auth-card h1 { font-size: 20px; font-weight: 800; color: #111827; margin: 0 0 4px; letter-spacing: 0; line-height: 1.25; min-height: 25px; }
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
        .auth-forgot { text-align: center; margin-top: 12px; }
        .auth-forgot button {
          background: none; border: none; color: #16A34A; cursor: pointer; font-size: 12.5px;
          font-weight: 700; font-family: inherit; padding: 0;
        }
        .auth-switch { text-align: center; font-size: 13px; color: #6B7280; margin-top: 18px; }
        .auth-switch button {
          background: none; border: none; color: #22C55E; font-weight: 700; cursor: pointer;
          font-size: 13px; font-family: inherit; padding: 0;
        }
      `}</style>
    </div>
  );
}
