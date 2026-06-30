import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase environment variables. Create a .env file " +
      "(see .env.example) with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, " +
      "or set them in your Netlify site settings under Environment variables."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
