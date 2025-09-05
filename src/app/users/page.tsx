'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { PermissionGuard } from '@/components/PermissionGuard'
import { User, UserRole } from '@/types/auth'
import { createClient } from '@/utils/supabase/client'
import toast from 'react-hot-toast'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'assistant' as UserRole
  })
  const [registerLoading, setRegisterLoading] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    onConfirm: () => {},
    type: 'danger'
  })
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
    // Find the user to get their name for the confirmation dialog
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const newRoleDisplay = newRole === 'admin' ? 'Administrator' : 'Assistant';
    
    setConfirmDialog({
      isOpen: true,
      title: `Change User Role`,
      message: `Are you sure you want to change ${user.full_name || user.email}'s role to ${newRoleDisplay}?`,
      confirmLabel: 'Change Role',
      cancelLabel: 'Cancel',
      type: 'warning',
      onConfirm: async () => {
        // Close dialog first
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        
        // Show loading toast
        const toastId = toast.loading(`Updating user role...`);
        
        try {
          const { error } = await supabase
            .from('user_profiles')
            .update({ role: newRole })
            .eq('id', userId)

          if (error) throw error
          
          setUsers(users.map(u => 
            u.id === userId ? { ...u, role: newRole } : u
          ))
          
          // Show success toast
          toast.success(`User role updated to ${newRoleDisplay}`, { id: toastId });
        } catch (err: any) {
          // Show error toast
          toast.error(`Failed to update role: ${err.message}`, { id: toastId });
          setError(err.message);
        }
      }
    });  }
  
  const deleteUser = async (userId: string) => {
    // Find the user to get their name for the confirmation dialog
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    setConfirmDialog({
      isOpen: true,
      title: 'Delete User',
      message: `Are you sure you want to delete ${user.full_name || user.email}? This action cannot be undone.`,
      confirmLabel: 'Delete User',
      cancelLabel: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        // Close dialog first
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        
        // Show loading toast
        const toastId = toast.loading(`Deleting user...`);
        
        try {
          // First, disable the auth user
          const disableResponse = await fetch('/api/users/disable', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
          })

          const disableData = await disableResponse.json()
          
          if (!disableResponse.ok) {
            throw new Error(disableData.message || 'Failed to disable user account')
          }
          
          // Then delete the user profile
          const { error } = await supabase
            .from('user_profiles')
            .delete()
            .eq('id', userId)

          if (error) throw error
          
          setUsers(users.filter(user => user.id !== userId))
          
          // Show success toast
          toast.success(`User deleted successfully`, { id: toastId });
        } catch (err: any) {
          // Show error toast
          toast.error(`Failed to delete user: ${err.message}`, { id: toastId });
          setError(err.message);
        }
      }
    });
  }  
  
  const registerUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterLoading(true)
    setError('')

    // Show loading toast
    const toastId = toast.loading(`Creating new user account...`);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerForm),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error cases
        let errorMessage = 'Failed to create user';
        if (data.instruction) {
          errorMessage = `${data.message}: ${data.instruction}`;
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        // Show error toast
        toast.error(errorMessage, { id: toastId });
        setError(errorMessage);
        return;
      }

      // Success case
      setUsers([data.data, ...users])
      setShowRegisterModal(false)
      setRegisterForm({
        email: '',
        password: '',
        full_name: '',
        role: 'assistant'
      })
      
      // Clear any previous errors
      setError('')
      
      // Show success toast
      toast.success(`User ${data.data.full_name || data.data.email} created successfully!`, { id: toastId });
    } catch (err: any) {
      // Show error toast
      toast.error(`Failed to create user: ${err.message}`, { id: toastId });
      setError(err.message)
    } finally {
      setRegisterLoading(false)
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
    >      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-black dark:text-white">
              User Management
            </h3>
            <PermissionGuard resource="users" action="create">
              <button
                onClick={() => setShowRegisterModal(true)}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90"
              >
                Register New User
              </button>
            </PermissionGuard>
          </div>
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

      {/* Register User Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-black dark:text-white">
                Register New User
              </h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={registerUser} className="space-y-4">
              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  Full Name
                </label>
                <input
                  type="text"
                  value={registerForm.full_name}
                  onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                  required
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  Email
                </label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  required
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  Password
                </label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  placeholder="Enter password (min 6 characters)"
                />
              </div>

              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  Role
                </label>
                <select
                  value={registerForm.role}
                  onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value as UserRole })}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="assistant">Assistant</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 rounded border border-stroke px-6 py-2 text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registerLoading}
                  className="flex-1 rounded bg-primary px-6 py-2 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                >
                  {registerLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>      )}
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={confirmDialog.cancelLabel}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        type={confirmDialog.type}
      />
    </PermissionGuard>
  )
}
