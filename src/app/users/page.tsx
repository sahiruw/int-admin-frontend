'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { PermissionGuard } from '@/components/PermissionGuard'
import { User, UserRole } from '@/types/auth'
import { createClient } from '@/utils/supabase/client'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user: currentUser } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchUsers()
    }
  }, [currentUser])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error
      
      setUsers(users.filter(user => user.id !== userId))
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <PermissionGuard 
      resource="users" 
      action="read"
      fallback={
        <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h1 className="text-xl font-semibold text-red-600">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to manage users.
          </p>
        </div>
      }
    >
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            User Management
          </h3>
        </div>
        
        <div className="p-6.5">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
              <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
            </div>
          )}

          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                      Name
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Email
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Role
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Created
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                        <h5 className="font-medium text-black dark:text-white">
                          {user.full_name || 'N/A'}
                        </h5>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {user.email}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-success bg-opacity-10 text-success' 
                            : 'bg-warning bg-opacity-10 text-warning'
                        }`}>
                          {user.role === 'admin' ? 'Administrator' : 'Assistant'}
                        </span>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <div className="flex items-center space-x-3.5">
                          <PermissionGuard resource="users" action="update">
                            {user.id !== currentUser?.id && (
                              <>
                                <button
                                  onClick={() => updateUserRole(
                                    user.id, 
                                    user.role === 'admin' ? 'assistant' : 'admin'
                                  )}
                                  className="text-primary hover:text-primary/80"
                                  title={`Make ${user.role === 'admin' ? 'Assistant' : 'Admin'}`}
                                >
                                  {user.role === 'admin' ? '↓' : '↑'}
                                </button>
                                <button
                                  onClick={() => deleteUser(user.id)}
                                  className="text-danger hover:text-danger/80"
                                  title="Delete User"
                                >
                                  🗑️
                                </button>
                              </>
                            )}
                          </PermissionGuard>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PermissionGuard>
  )
}
