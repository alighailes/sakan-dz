import { createClient, type SupabaseClient, type Session, type User } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('example.com') &&
    !supabaseUrl.includes('your-project-ref') &&
    supabaseAnonKey !== 'placeholder-anon-key-12345' &&
    supabaseAnonKey !== 'your-anon-key-here' &&
    supabaseAnonKey.length > 20
  )
}

/**
 * Synchronously read the Supabase Auth session cached in localStorage
 * (key `sb-<project-ref>-auth-token`, written by supabase-js with
 * persistSession). Returns null when absent, expired, or unparsable.
 * Used to seed auth state on cold boot so the UI holds the signed-in
 * state instead of flashing a logged-out view until getSession() resolves.
 */
export function readCachedSupabaseSession(): { user: User; session: Session } | null {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null
    const ref = new URL(supabaseUrl).hostname.split('.')[0]
    if (!ref) return null
    const raw = localStorage.getItem(`sb-${ref}-auth-token`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Session> & {
      user?: User
      currentSession?: Partial<Session> & { user?: User }
    }
    const sess = parsed?.currentSession ?? parsed
    if (!sess?.user || typeof sess.access_token !== 'string') return null
    if (typeof sess.expires_at === 'number' && sess.expires_at * 1000 <= Date.now()) return null
    return { user: sess.user, session: sess as Session }
  } catch {
    return null
  }
}
