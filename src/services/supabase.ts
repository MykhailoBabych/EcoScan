import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase configuration. Set EXPO_PUBLIC_SUPABASE_URL and ' +
      'EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file (see .env.example).',
  );
}

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
