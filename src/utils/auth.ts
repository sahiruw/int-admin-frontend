import { createClient } from '@/utils/supabase/supabase'
import { User, UserRole, ACCESS_MATRIX, ResourceType, ActionType } from '@/types/auth'

export async function getServerUser(): Promise<User | null> {
  try {
    const supabase = await createClient()
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !supabaseUser) {
      return null
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single()

    if (profileError || !userProfile) {
      return null
    }

    return userProfile
  } catch (error) {
    console.error('Error getting server user:', error)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getServerUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()
  if (user.role !== 'admin') {
    throw new Error('Admin access required')
  }
  return user
}

export function hasPermission(user: User | null, resource: ResourceType, action: ActionType): boolean {
  if (!user) return false
  
  const resourcePermissions = ACCESS_MATRIX[resource]
  if (!resourcePermissions) return false
  
  const actionPermissions = resourcePermissions[action]
  if (!actionPermissions) return false
  
  return actionPermissions[user.role] || false
}

export function requirePermission(user: User | null, resource: ResourceType, action: ActionType): void {
  if (!hasPermission(user, resource, action)) {
    throw new Error(`Permission denied: ${action} on ${resource}`)
  }
}

export async function withAuth<T>(
  handler: (user: User) => Promise<T>
): Promise<T> {
  const user = await requireAuth()
  return handler(user)
}

export async function withPermission<T>(
  resource: ResourceType,
  action: ActionType,
  handler: (user: User) => Promise<T>
): Promise<T> {
  const user = await requireAuth()
  requirePermission(user, resource, action)
  return handler(user)
}
