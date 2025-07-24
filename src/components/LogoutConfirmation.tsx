'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'

interface LogoutConfirmationProps {
  isOpen: boolean
  onClose: () => void
}

export function LogoutConfirmation({ isOpen, onClose }: LogoutConfirmationProps) {
  const [loading, setLoading] = useState(false)
  const { signOut } = useAuth()

  if (!isOpen) return null

  const handleLogout = async () => {
    setLoading(true)
    await signOut()
    // signOut already handles redirect, so no need to do anything else
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Confirm Logout
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to sign out? You'll need to sign in again to access the admin panel.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-md disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
          >
            {loading ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </div>
    </div>
  )
}
