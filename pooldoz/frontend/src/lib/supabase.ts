import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Only create the Supabase client if we have valid config
// Without it, the app runs in fully local mode (Dexie only)
let _supabase: SupabaseClient | null = null

if (supabaseUrl && supabaseAnonKey) {
  try {
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // JWT stays in memory only (NFR-4 — no localStorage for tokens)
        storage: {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        },
        autoRefreshToken: true,
        persistSession: false,
      },
    })
  } catch (e) {
    console.warn('[supabase] Failed to create client:', e)
  }
}

// Lazy accessor — returns null when Supabase is not configured
export function getSupabase(): SupabaseClient | null {
  return _supabase
}

// For backward compat — some stores use this directly
// Returns a mock-safe proxy when not configured
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (_supabase) return (_supabase as unknown as Record<string | symbol, unknown>)[prop]
    // Return no-op functions for auth/db calls when offline
    return () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
  }
})
