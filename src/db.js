import { requireSupabase } from "./supabaseClient.js";

const DEFAULT_GOAL_YEARS = 5;
const DEPOSIT_COLUMNS = "id, date, amount, category, note, created_at";
const SETTINGS_COLUMNS = "goal, lang, dark, goal_years, goal_started_at, goal_deadline";
const TIMELINE_SETTINGS_COLUMNS = "goal, lang, dark, goal_years, goal_started_at";
const LEGACY_SETTINGS_COLUMNS = "goal, lang, dark";

const pad2 = (n) => String(n).padStart(2, "0");
const todayISO = () => {
  const date = new Date();
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};
const isISODate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
const dateFromISO = (iso) => {
  const safe = isISODate(iso) ? iso : todayISO();
  const [year, month, day] = safe.split("-").map(Number);
  return new Date(year, month - 1, day);
};
const normalizeGoalYears = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return DEFAULT_GOAL_YEARS;
  return Math.min(50, Math.max(1, Math.round(num)));
};
const addYearsISO = (iso, years) => {
  const date = dateFromISO(iso);
  date.setFullYear(date.getFullYear() + normalizeGoalYears(years));
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

function settingsColumnMissing(error) {
  const text = `${error?.message || ""} ${error?.details || ""} ${error?.hint || ""}`;
  return text.includes("goal_years") || text.includes("goal_started_at") || text.includes("goal_deadline");
}

function withSettingsDefaults(data) {
  if (!data) return null;
  const goalStartedAt = isISODate(data.goal_started_at) ? data.goal_started_at : todayISO();
  const goalYears = normalizeGoalYears(data.goal_years);
  return {
    ...data,
    goal_years: goalYears,
    goal_started_at: goalStartedAt,
    goal_deadline: isISODate(data.goal_deadline) ? data.goal_deadline : addYearsISO(goalStartedAt, goalYears),
  };
}

/**
 * Data access layer backed by Supabase Postgres tables, scoped per
 * signed-in user via Row Level Security (see supabase-schema.sql).
 *
 * This replaces the old localStorage-based persistence. The shape of
 * each function mirrors what DimeTracker.jsx already expects, so the
 * component only needed to swap which module it imports from.
 */

// ---------------------------------------------------------------------
// Deposits
// ---------------------------------------------------------------------

export async function listDeposits() {
  const { data, error } = await requireSupabase()
    .from("deposits")
    .select(DEPOSIT_COLUMNS)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function insertDeposit(userId, deposit) {
  const { data, error } = await requireSupabase()
    .from("deposits")
    .insert({
      user_id: userId,
      date: deposit.date,
      amount: deposit.amount,
      category: deposit.category,
      note: deposit.note ?? "",
    })
    .select(DEPOSIT_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}

export async function updateDeposit(deposit) {
  const { data, error } = await requireSupabase()
    .from("deposits")
    .update({
      date: deposit.date,
      amount: deposit.amount,
      category: deposit.category,
      note: deposit.note ?? "",
    })
    .eq("id", deposit.id)
    .select(DEPOSIT_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDeposit(id) {
  const { error } = await requireSupabase().from("deposits").delete().eq("id", id);
  if (error) throw error;
}

export async function bulkInsertDeposits(userId, deposits) {
  if (!deposits.length) return [];
  const rows = deposits.map((d) => ({
    user_id: userId,
    date: d.date,
    amount: d.amount,
    category: d.category,
    note: d.note ?? "",
  }));
  const { data, error } = await requireSupabase()
    .from("deposits")
    .insert(rows)
    .select(DEPOSIT_COLUMNS);
  if (error) throw error;
  return data ?? [];
}

// ---------------------------------------------------------------------
// Settings (goal / timeline / language / theme) -- one row per user, upserted
// ---------------------------------------------------------------------

export async function getSettings(userId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("user_settings")
    .select(SETTINGS_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();
  if (!error) return withSettingsDefaults(data); // null if the user has never saved settings yet

  // Lets older projects keep loading until supabase-schema.sql is re-run.
  if (!settingsColumnMissing(error)) throw error;

  const timeline = await client
    .from("user_settings")
    .select(TIMELINE_SETTINGS_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();
  if (!timeline.error) return withSettingsDefaults(timeline.data);

  const legacy = await client
    .from("user_settings")
    .select(LEGACY_SETTINGS_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();
  if (legacy.error) throw legacy.error;
  return withSettingsDefaults(legacy.data);
}

export async function upsertSettings(userId, partial) {
  const { error } = await requireSupabase()
    .from("user_settings")
    .upsert({ user_id: userId, ...partial, updated_at: new Date().toISOString() });
  if (error) throw error;
}
