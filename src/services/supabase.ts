import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pefjpfcgrtgoctlewxvn.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZmpwZmNncnRnb2N0bGV3eHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMTk0MTgsImV4cCI6MjA5NjY5NTQxOH0.BdmQFM77DqIJEzpI_uQfWuqYv5xwpGMg9UjijdFRcs4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Email sign-up ────────────────────────────────────────────────────────────

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<{ sessionCreated: boolean; error: string | null }> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { sessionCreated: false, error: error.message };
  // If email confirmation is required, data.session will be null
  return { sessionCreated: !!data.session, error: null };
}

// ─── Email sign-in ────────────────────────────────────────────────────────────

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ userId: string | null; error: string | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { userId: null, error: error.message };
  return { userId: data.user?.id ?? null, error: null };
}

// ─── Legacy anonymous sign-in (kept for devices that already have a session) ──

export async function ensureSignedIn(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) return session.user.id;
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) { console.warn('[Supabase] anonymous sign-in failed:', error.message); return null; }
  return data.user?.id ?? null;
}
