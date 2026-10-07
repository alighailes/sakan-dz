import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { UserProfile, UserType, UserRole } from '@/types'

// ============================================================
// Mock Mode Password Hashing
// Simple hash function for mock mode only (NOT cryptographically secure).
// In production, Supabase Auth handles password hashing with bcrypt.
// This prevents plaintext passwords from being stored in localStorage.
// ============================================================
function mockHashPassword(password: string): string {
  let hash = 0
  const salted = `sakan-dz-mock-salt:${password}`
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return `mockhash_${Math.abs(hash).toString(16)}`
}

// ============================================================
// Types
// ============================================================

export interface SignUpMetadata {
  full_name: string
  phone_number: string
  user_type: UserType
  agency_name?: string
  wilaya_id: number
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  error: string | null
  isMockMode: boolean
  /** Canonical buyer/seller UI mode. Seeded synchronously from localStorage. */
  activeRole: UserRole | null

  initialize: () => Promise<void>
  signUp: (email: string, password: string, metadata: SignUpMetadata) => Promise<void>
  signInWithPassword: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  updateRole: (role: UserRole) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  clearError: () => void
}

// ============================================================
// Mock Mode Helpers (localStorage-based)
// ============================================================

const MOCK_USERS_KEY = 'sakan-mock-users'
const MOCK_SESSION_KEY = 'sakan-mock-session'

interface MockUser {
  id: string
  email: string
  password: string
  profile: UserProfile
  created_at: string
}

interface MockSession {
  user: MockUser
  expires_at: string
}

function getMockUsers(): MockUser[] {
  try {
    return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveMockUsers(users: MockUser[]) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users))
}

function getMockSession(): MockSession | null {
  try {
    const data = localStorage.getItem(MOCK_SESSION_KEY)
    if (!data) return null
    const session = JSON.parse(data) as MockSession
    if (new Date(session.expires_at) < new Date()) {
      localStorage.removeItem(MOCK_SESSION_KEY)
      return null
    }
    return session
  } catch {
    return null
  }
}

function saveMockSession(session: MockSession) {
  localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session))
}

function clearMockSession() {
  localStorage.removeItem(MOCK_SESSION_KEY)
}

// Role fallback persisted per user (used when profiles.role column is absent)
const ROLE_STORAGE_PREFIX = 'sakan-user-role'
// Global active-role key: written on every switch, read on init before 'buyer'
const ACTIVE_ROLE_KEY = 'sakan_active_role'

function readRoleKey(key: string): UserRole | undefined {
  try {
    const raw = localStorage.getItem(key)
    return raw === 'buyer' || raw === 'seller' ? raw : undefined
  } catch {
    return undefined
  }
}

function getStoredRole(userId: string): UserRole | undefined {
  return readRoleKey(`${ROLE_STORAGE_PREFIX}:${userId}`) ?? readRoleKey(ACTIVE_ROLE_KEY)
}

function setStoredRole(userId: string, role: UserRole) {
  try {
    localStorage.setItem(`${ROLE_STORAGE_PREFIX}:${userId}`, role)
    localStorage.setItem(ACTIVE_ROLE_KEY, role)
  } catch {
    // Storage unavailable — in-memory profile value still applies
  }
}

function clearActiveRole() {
  try {
    localStorage.removeItem(ACTIVE_ROLE_KEY)
  } catch {
    // ignore
  }
}

/**
 * Resolve the canonical UI role without ever resetting it to a default.
 * Precedence: Supabase profile.role (mirrored to storage immediately) >
 * stored per-user/global role > current in-memory value (survives loading
 * and refetches). Returns null only when nothing is known yet.
 */
function resolveActiveRole(
  serverRole: unknown,
  userId: string | undefined,
  current: UserRole | null
): UserRole | null {
  if (serverRole === 'buyer' || serverRole === 'seller') {
    if (userId) setStoredRole(userId, serverRole)
    else {
      try {
        localStorage.setItem(ACTIVE_ROLE_KEY, serverRole)
      } catch {
        // ignore
      }
    }
    return serverRole
  }
  if (userId) {
    const stored = getStoredRole(userId)
    if (stored) return stored
  }
  return current
}

function createMockUser(mockUser: MockUser): User {
  return {
    id: mockUser.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: mockUser.email,
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: { provider: 'email' },
    user_metadata: {
      full_name: mockUser.profile.full_name,
      phone_number: mockUser.profile.phone_number,
      user_type: mockUser.profile.user_type,
    },
    identities: [],
    created_at: mockUser.created_at,
    updated_at: new Date().toISOString(),
  }
}

function createMockSession(mockUser: MockUser): Session {
  return {
    access_token: 'mock-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: 'mock-refresh-token',
    user: createMockUser(mockUser),
  }
}

// ============================================================
// Auth Store
// ============================================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      session: null,
      loading: true,
      error: null,
      isMockMode: false,
      // Synchronous initial read: valid stored role wins, otherwise null
      // (consumers fall back to buyer UI until a role is known).
      activeRole: readRoleKey(ACTIVE_ROLE_KEY) ?? null,

      // Initialize auth state
      initialize: async () => {
        set({ loading: true })

        if (isSupabaseConfigured()) {
          try {
            // Get current session
            const { data: { session } } = await supabase.auth.getSession()

            if (session?.user) {
              // Fetch profile
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()

              set({
                user: session.user,
                profile: profile || null,
                session,
                loading: false,
                isMockMode: false,
                activeRole: resolveActiveRole(profile?.role, session.user.id, get().activeRole),
              })
            } else {
              set({ user: null, profile: null, session: null, loading: false, isMockMode: false })
            }

            // Listen for auth changes
            supabase.auth.onAuthStateChange(async (event, newSession) => {
              if (event === 'SIGNED_IN' && newSession?.user) {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', newSession.user.id)
                  .single()

                set({
                  user: newSession.user,
                  profile: profile || null,
                  session: newSession,
                  isMockMode: false,
                  activeRole: resolveActiveRole(profile?.role, newSession.user.id, get().activeRole),
                })
              } else if (event === 'SIGNED_OUT') {
                set({ user: null, profile: null, session: null, isMockMode: false })
              } else if (event === 'TOKEN_REFRESHED' && newSession) {
                set({ session: newSession })
              }
            })
          } catch {
            set({ user: null, profile: null, session: null, loading: false, isMockMode: false })
          }
        } else {
          // Mock mode - check localStorage
          const mockSession = getMockSession()
          if (mockSession) {
            set({
              user: createMockUser(mockSession.user),
              profile: mockSession.user.profile,
              session: createMockSession(mockSession.user),
              loading: false,
              isMockMode: true,
              activeRole: resolveActiveRole(mockSession.user.profile.role, mockSession.user.id, get().activeRole),
            })
          } else {
            set({ user: null, profile: null, session: null, loading: false, isMockMode: true })
          }
        }
      },

      // Sign up
      signUp: async (email, password, metadata) => {
        set({ loading: true, error: null })

        if (isSupabaseConfigured()) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: metadata.full_name,
                phone_number: metadata.phone_number,
                user_type: metadata.user_type,
                agency_name: metadata.agency_name,
                wilaya_id: metadata.wilaya_id,
              },
            },
          })

          if (error) {
            set({ loading: false, error: error.message })
            throw new Error(error.message)
          }

          if (data.user) {
            // Create profile row
            const profile: Omit<UserProfile, 'created_at' | 'updated_at'> = {
              id: data.user.id,
              full_name: metadata.full_name,
              phone_number: metadata.phone_number,
              user_type: metadata.user_type,
              agency_name: metadata.agency_name,
              wilaya_id: metadata.wilaya_id,
            }

            await supabase.from('profiles').upsert(profile)

            set({
              user: data.user,
              profile: { ...profile, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
              session: data.session,
              loading: false,
              isMockMode: false,
              activeRole: resolveActiveRole(profile?.role, data.user.id, get().activeRole),
            })
          }
        } else {
          // Mock mode
          await new Promise((resolve) => setTimeout(resolve, 800))

          const users = getMockUsers()
          if (users.find((u) => u.email === email)) {
            set({ loading: false, error: 'auth.emailExists' })
            throw new Error('auth.emailExists')
          }

          const newUser: MockUser = {
            id: crypto.randomUUID(),
            email,
            password: mockHashPassword(password),
            profile: {
              id: crypto.randomUUID(),
              full_name: metadata.full_name,
              phone_number: metadata.phone_number,
              user_type: metadata.user_type,
              agency_name: metadata.agency_name,
              wilaya_id: metadata.wilaya_id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            created_at: new Date().toISOString(),
          }

          saveMockUsers([...users, newUser])
          saveMockSession({
            user: newUser,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          })

          set({
            user: createMockUser(newUser),
            profile: newUser.profile,
            session: createMockSession(newUser),
            loading: false,
            isMockMode: true,
            activeRole: resolveActiveRole(newUser.profile.role, newUser.id, get().activeRole),
          })
        }
      },

      // Sign in with password
      signInWithPassword: async (email, password) => {
        set({ loading: true, error: null })

        if (isSupabaseConfigured()) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            set({ loading: false, error: error.message })
            throw new Error(error.message)
          }

          if (data.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single()

            set({
              user: data.user,
              profile: profile || null,
              session: data.session,
              loading: false,
              isMockMode: false,
              activeRole: resolveActiveRole(profile?.role, data.user.id, get().activeRole),
            })
          }
        } else {
          // Mock mode
          await new Promise((resolve) => setTimeout(resolve, 800))

          const users = getMockUsers()
          const found = users.find((u) => u.email === email && u.password === mockHashPassword(password))

          if (!found) {
            set({ loading: false, error: 'auth.invalidCredentials' })
            throw new Error('auth.invalidCredentials')
          }

          saveMockSession({
            user: found,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          })

          set({
            user: createMockUser(found),
            profile: found.profile,
            session: createMockSession(found),
            loading: false,
            isMockMode: true,
            activeRole: resolveActiveRole(found.profile.role, found.id, get().activeRole),
          })
        }
      },

      // Sign out
      signOut: async () => {
        set({ loading: true })

        if (isSupabaseConfigured()) {
          await supabase.auth.signOut()
        } else {
          clearMockSession()
        }

        // Drop the device-level active role so a different account signing in
        // next does not inherit it (per-user keys + server column remain).
        clearActiveRole()
        set({ user: null, profile: null, session: null, loading: false, activeRole: null })
      },

      // Update profile
      updateProfile: async (updates) => {
        const { user, profile } = get()
        if (!user || !profile) return

        set({ loading: true, error: null })

        if (isSupabaseConfigured()) {
          const { error } = await supabase
            .from('profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', user.id)

          if (error) {
            set({ loading: false, error: error.message })
            throw new Error(error.message)
          }

          set({ profile: { ...profile, ...updates }, loading: false })
        } else {
          // Mock mode
          const users = getMockUsers()
          const idx = users.findIndex((u) => u.id === user.id)
          if (idx >= 0) {
            users[idx].profile = { ...users[idx].profile, ...updates }
            saveMockUsers(users)

            const mockSession = getMockSession()
            if (mockSession) {
              mockSession.user.profile = users[idx].profile
              saveMockSession(mockSession)
            }
          }

          set({ profile: { ...profile, ...updates }, loading: false })
        }

        // Keep the canonical role in sync if a role arrived via profile update
        if (updates.role === 'buyer' || updates.role === 'seller') {
          set({ activeRole: updates.role })
          setStoredRole(user.id, updates.role)
        }
      },

      // Update buyer/seller UI role (instant local update + Supabase persist)
      updateRole: async (role) => {
        const { user, profile, isMockMode } = get()
        if (!user) return

        set({ profile: profile ? { ...profile, role } : profile, activeRole: role })
        setStoredRole(user.id, role)

        if (isMockMode) {
          const users = getMockUsers()
          const idx = users.findIndex((u) => u.id === user.id)
          if (idx >= 0) {
            users[idx].profile = { ...users[idx].profile, role }
            saveMockUsers(users)
            const mockSession = getMockSession()
            if (mockSession) {
              mockSession.user.profile = users[idx].profile
              saveMockSession(mockSession)
            }
          }
          return
        }

        if (isSupabaseConfigured()) {
          const { error } = await supabase.from('profiles').update({ role }).eq('id', user.id)
          if (error) {
            // Column may not exist yet in production — local + stored value stands.
            console.warn('Could not persist role to profiles table:', error.message)
          }
        }
      },

      // Reset password
      resetPassword: async (email) => {
        set({ loading: true, error: null })

        if (isSupabaseConfigured()) {
          const redirectUrl = `${window.location.origin}/sakan-dz/reset-password`
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl,
          })

          if (error) {
            set({ loading: false, error: error.message })
            throw new Error(error.message)
          }
        } else {
          // Mock mode - just simulate
          await new Promise((resolve) => setTimeout(resolve, 800))
        }

        set({ loading: false })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'sakan-auth',
      partialize: (state) => ({
        isMockMode: state.isMockMode,
      }),
    }
  )
)
