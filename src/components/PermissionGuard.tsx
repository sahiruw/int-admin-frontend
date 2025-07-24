'use client'

import { useAuth } from '@/hooks/use-auth'
import { ResourceType, ActionType } from '@/types/auth'

interface PermissionGuardProps {
  resource: ResourceType
  action: ActionType
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAdmin?: boolean
}

export function PermissionGuard({ 
  resource, 
  action, 
  children, 
  fallback = null,
  requireAdmin = false
}: PermissionGuardProps) {
  const { hasPermission, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-6 w-20"></div>
    )
  }

  if (requireAdmin && !isAdmin()) {
    return <>{fallback}</>
  }

  if (!hasPermission(resource, action)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Higher-order component version
export function withPermission<T extends object>(
  Component: React.ComponentType<T>,
  resource: ResourceType,
  action: ActionType,
  fallback?: React.ReactNode
) {
  return function PermissionWrappedComponent(props: T) {
    return (
      <PermissionGuard resource={resource} action={action} fallback={fallback}>
        <Component {...props} />
      </PermissionGuard>
    )
  }
}

// Hook for conditional rendering
export function usePermission(resource: ResourceType, action: ActionType) {
  const { hasPermission } = useAuth()
  return hasPermission(resource, action)
}

// Hook for admin check
export function useIsAdmin() {
  const { isAdmin } = useAuth()
  return isAdmin()
}
