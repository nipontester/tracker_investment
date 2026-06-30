import { requireSupabase } from "./supabaseClient.js";

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
    .select("id, date, amount, category, note")
    .order("date", { ascending: false });
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
    .select("id, date, amount, category, note")
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
    .select("id, date, amount, category, note")
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
    .select("id, date, amount, category, note");
  if (error) throw error;
  return data ?? [];
}

// ---------------------------------------------------------------------
// Settings (goal / language / theme) -- one row per user, upserted
// ---------------------------------------------------------------------

export async function getSettings(userId) {
  const { data, error } = await requireSupabase()
    .from("user_settings")
    .select("goal, lang, dark")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data; // null if the user has never saved settings yet
}

export async function upsertSettings(userId, partial) {
  const { error } = await requireSupabase()
    .from("user_settings")
    .upsert({ user_id: userId, ...partial, updated_at: new Date().toISOString() });
  if (error) throw error;
}
