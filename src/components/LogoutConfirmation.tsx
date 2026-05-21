'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Modal, ModalFooter, ConfirmButton, CancelButton } from '@/components/ui/Modal'

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
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Logout" contentClassName="pb-0">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Are you sure you want to sign out? You'll need to sign in again to access the admin panel.
      </p>
      <ModalFooter className="-mx-6 mt-6 mb-0 rounded-b-lg">
        <CancelButton onClick={onClose} disabled={loading} className="flex-1">
          Cancel
        </CancelButton>
        <ConfirmButton onClick={handleLogout} disabled={loading} variant="danger" className="flex-1">
          {loading ? 'Signing out...' : 'Sign out'}
        </ConfirmButton>
      </ModalFooter>
    </Modal>
  )
}
