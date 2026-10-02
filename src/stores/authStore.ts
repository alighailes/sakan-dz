import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { UserProfile, UserType } from '@/types'

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

  initialize: () => Promise<void>
  signUp: (email: string, password: string, metadata: SignUpMetadata) => Promise<void>
  signInWithPassword: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
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

        set({ user: null, profile: null, session: null, loading: false })
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
      },

      // Reset password
      resetPassword: async (email) => {
        set({ loading: true, error: null })

        if (isSupabaseConfigured()) {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}reset-password`,
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
