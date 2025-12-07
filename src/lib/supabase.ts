/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const skipAuth = import.meta.env.VITE_SKIP_AUTH === "true";

// Solo crear cliente si las variables están configuradas
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Helper para saber si estamos usando Supabase o localStorage
export const isSupabaseEnabled = () => !!supabase;

// Helper para saber si debemos requerir autenticación
export const isAuthRequired = () => isSupabaseEnabled() && !skipAuth;
