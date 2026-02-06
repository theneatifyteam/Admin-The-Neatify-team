import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zwidqujljmgdrlpafino.supabase.co";
const supabaseAnonKey = "sb_publishable_Za7NRfol5VlcRtwNTP9HvA_gIYGM0yp";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase env variables not found");
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: window.sessionStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);