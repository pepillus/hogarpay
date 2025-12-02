import { supabase, isSupabaseEnabled } from "./supabase";
import type { User, Session } from "@supabase/supabase-js";

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

// Iniciar sesión con email y password
export const signIn = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
  if (!isSupabaseEnabled() || !supabase) {
    return { user: null, error: "Supabase no está configurado" };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
};

// Registrar nuevo usuario
export const signUp = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
  if (!isSupabaseEnabled() || !supabase) {
    return { user: null, error: "Supabase no está configurado" };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
};

// Cerrar sesión
export const signOut = async (): Promise<{ error: string | null }> => {
  if (!isSupabaseEnabled() || !supabase) {
    return { error: "Supabase no está configurado" };
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  return { error: null };
};

// Obtener sesión actual
export const getSession = async (): Promise<Session | null> => {
  if (!isSupabaseEnabled() || !supabase) {
    return null;
  }

  const { data } = await supabase.auth.getSession();
  return data.session;
};

// Obtener usuario actual
export const getUser = async (): Promise<User | null> => {
  if (!isSupabaseEnabled() || !supabase) {
    return null;
  }

  const { data } = await supabase.auth.getUser();
  return data.user;
};

// Suscribirse a cambios de autenticación
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!isSupabaseEnabled() || !supabase) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
};
