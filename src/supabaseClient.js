import { createClient } from "@supabase/supabase-js";

function cleanEnvValue(value) {
  const raw = String(value ?? "").trim().replace(/^['"]|['"]$/g, "");
  const markdownLink = raw.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  return (markdownLink?.[2] || markdownLink?.[1] || raw).trim();
}

function cleanSupabaseUrl(value) {
  const raw = cleanEnvValue(value);
  if (!raw) return "";

  try {
    const url = new URL(raw);
    return url.origin;
  } catch {
    return raw;
  }
}

const supabaseUrl = cleanSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = cleanEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY);

const missingConfigMessage =
  "Missing Supabase environment variables. Create a .env file " +
  "(see .env.example) with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, " +
  "or set them in your Netlify site settings under Environment variables.";

const invalidUrlMessage =
  "VITE_SUPABASE_URL is not a valid URL. It should look like https://your-project-ref.supabase.co";

function getConfigError() {
  if (!supabaseUrl || !supabaseAnonKey) return missingConfigMessage;
  try {
    new URL(supabaseUrl);
    return "";
  } catch {
    return invalidUrlMessage;
  }
}

export const supabaseConfigError = getConfigError();

if (supabaseConfigError) {
  console.error(supabaseConfigError);
}

export const supabase = supabaseConfigError
  ? null
  : createClient(supabaseUrl, supabaseAnonKey);

export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      supabaseConfigError ||
        "Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    );
  }
  return supabase;
}

export const supabaseConfig = {
  hasUrl: Boolean(supabaseUrl),
  hasAnonKey: Boolean(supabaseAnonKey),
  urlHost: (() => {
    try {
      return supabaseUrl ? new URL(supabaseUrl).host : "";
    } catch {
      return "";
    }
  })(),
};
