'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import { User, UserRole, ACCESS_MATRIX, ResourceType, ActionType } from '@/types/auth'

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  supabaseUser: SupabaseUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, fullName: string, role?: UserRole) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  hasPermission: (resource: ResourceType, action: ActionType) => boolean
  isAdmin: () => boolean
  isAssistant: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    console.log('AuthProvider mounted')

    const loadUserProfile = async (userId: string) => {
      console.log('Fetching user profile for userId:', userId)
      let attempts = 0
      let profile: User | null = null

      while (!profile && attempts < 5) {
        console.log('Before supabase read for user profile')
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .limit(1)
          .single()
        
        console.log('After supabase read for user profile')

        if (error) {
          console.warn('Error fetching profile (attempt', attempts + 1, '):', error.message)
        } else if (data) {
          profile = data as User
        }

        if (!profile) {
          attempts++
          await new Promise(res => setTimeout(res, 1000)) // wait before retry
        }
      }

      if (profile) {
        setUser(profile)
        console.log('User profile set:', profile)
      } else {
        console.error('Failed to fetch user profile after retries')
      }
    }

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setSupabaseUser(user)
        loadUserProfile(user.id)
        loadUserProfile(user.id)
      }
      setLoading(false)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user)
          await loadUserProfile(session.user.id)
        } else {
          setSupabaseUser(null)
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? { error: error.message } : {}
  }

  const signUp = async (email: string, password: string, fullName: string, role: UserRole = 'assistant') => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } }
    })
    return error ? { error: error.message } : {}
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSupabaseUser(null)
    window.location.href = '/auth/login'
  }

  const hasPermission = (resource: ResourceType, action: ActionType): boolean => {
    if (!user) return false
    return ACCESS_MATRIX[resource]?.[action]?.[user.role] || false
  }

  const isAdmin = (): boolean => user?.role === 'admin'
  const isAssistant = (): boolean => user?.role === 'assistant'

  const value: AuthContextType = {
    user, setUser,
    supabaseUser,
    loading,
    signIn,
    signUp,
    signOut,
    hasPermission,
    isAdmin,
    isAssistant,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
