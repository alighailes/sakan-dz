import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { UserProfile } from '@/types'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
  signUpWithEmail: (email: string, password: string, metadata: {
    full_name: string
    phone_number: string
    user_type: 'individual' | 'agency'
    agency_name?: string
    wilaya_id: number
  }) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch profile from profiles table
  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured()) return null

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data as UserProfile
    } catch (err) {
      console.error('Error fetching profile:', err)
      return null
    }
  }

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      if (!isSupabaseConfigured()) {
        setLoading(false)
        return
      }

      // Get initial session
      const { data: { session: initialSession } } = await supabase.auth.getSession()
      setSession(initialSession)
      setUser(initialSession?.user ?? null)

      if (initialSession?.user) {
        const userProfile = await fetchProfile(initialSession.user.id)
        setProfile(userProfile)
      }

      setLoading(false)
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)

      if (newSession?.user) {
        const userProfile = await fetchProfile(newSession.user.id)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase not configured') }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ?? null }
  }

  const signUpWithEmail = async (
    email: string,
    password: string,
    metadata: {
      full_name: string
      phone_number: string
      user_type: 'individual' | 'agency'
      agency_name?: string
      wilaya_id: number
    }
  ) => {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase not configured') }
    }

    const { error } = await supabase.auth.signUp({
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

    return { error: error ?? null }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured()) return

    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase not configured') }
    }

    const redirectUrl = `${window.location.origin}/sakan-dz/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })

    return { error: error ?? null }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!isSupabaseConfigured() || !user) {
      return { error: new Error('Not authenticated') }
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null)
    }

    return { error: error ?? null }
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      resetPassword,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}