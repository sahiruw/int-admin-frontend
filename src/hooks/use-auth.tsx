'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import { User, UserRole, ACCESS_MATRIX, ResourceType, ActionType } from '@/types/auth'

interface AuthContextType {
  user: User | null
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
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setSupabaseUser(session.user)
        await fetchUserProfile(session.user.id)
      }
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user)
          await fetchUserProfile(session.user.id)
        } else {
          setSupabaseUser(null)
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return
      }

      if (data) {
        setUser(data)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    return {}
  }

  const signUp = async (email: string, password: string, fullName: string, role: UserRole = 'assistant') => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role
        }
      }
    })

    if (error) {
      return { error: error.message }
    }

    return {}
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSupabaseUser(null)
    // Redirect to login page
    window.location.href = '/auth/login'
  }

  const hasPermission = (resource: ResourceType, action: ActionType): boolean => {
    if (!user) return false
    
    const resourcePermissions = ACCESS_MATRIX[resource]
    if (!resourcePermissions) return false
    
    const actionPermissions = resourcePermissions[action]
    if (!actionPermissions) return false
    
    return actionPermissions[user.role] || false
  }

  const isAdmin = (): boolean => {
    return user?.role === 'admin'
  }

  const isAssistant = (): boolean => {
    return user?.role === 'assistant'
  }
  const value = {
    user,
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
