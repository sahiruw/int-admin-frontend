'use client'

import { useAuth } from '@/hooks/use-auth'

export default function DebugPage() {
  const { user, supabaseUser, hasPermission, isAdmin, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Supabase User:</h2>
          <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto">
            {JSON.stringify(supabaseUser, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-lg font-semibold">User Profile:</h2>
          <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Permission Checks:</h2>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
            <p>Is Admin: {isAdmin() ? 'Yes' : 'No'}</p>
            <p>Has users.read permission: {hasPermission('users', 'read') ? 'Yes' : 'No'}</p>
            <p>Has users.create permission: {hasPermission('users', 'create') ? 'Yes' : 'No'}</p>
            <p>User role: {user?.role || 'undefined'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
