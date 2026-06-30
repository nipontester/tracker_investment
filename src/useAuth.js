import { useState, useEffect } from "react";
import { supabase, supabaseConfigError } from "./supabaseClient.js";

/**
 * Tracks the current Supabase auth session. Exposes the signed-in user
 * (or null), a loading flag for the initial session check, and a
 * signOut helper. DimeTracker only renders once `loading` is false;
 * if `user` is null at that point, the app shows the Auth screen instead.
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!supabase) {
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecovery(true);
      }
      if (event === "SIGNED_OUT") {
        setPasswordRecovery(false);
      }
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (cancelled) return;
        setUser(session?.user ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = () => supabase?.auth.signOut();
  const clearPasswordRecovery = () => setPasswordRecovery(false);

  return {
    user,
    loading,
    signOut,
    configError: supabaseConfigError,
    passwordRecovery,
    clearPasswordRecovery,
  };
}
