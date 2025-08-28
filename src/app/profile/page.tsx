'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/utils/supabase/client'
import { Eye, EyeOff } from 'lucide-react'
import { AvatarUpload } from '@/components/FormElements/avatar-upload'

export default function ProfilePage() {
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
    const { user } = useAuth()
  const supabase = createClient()
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        setFullName(user.full_name || '')
        
        // Get complete profile info from the database
        const { data, error } = await supabase
          .from('user_profiles')
          .select('avatar_url, full_name')
          .eq('id', user.id)
          .single()
        
        if (data && !error) {
          setAvatarUrl(data.avatar_url)
          if (data.full_name && data.full_name !== user.full_name) {
            setFullName(data.full_name)
          }
        }
      }
    }    
    fetchUserProfile()
  }, [user])
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          full_name: fullName,
          avatar_url: avatarUrl
        })
        .eq('id', user?.id)

      if (error) throw error
      
      // Update the user context with new information
      const { data: updatedUser } = await supabase.auth.getUser()
      
      setMessage('Profile updated successfully!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  // Handle avatar change from the AvatarUpload component
  const handleAvatarChange = (url: string) => {
    setAvatarUrl(url)
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setError('')
    setMessage('')

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      setPasswordLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long')
      setPasswordLoading(false)
      return
    }

    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      })

      if (signInError) {
        setError('Current password is incorrect')
        setPasswordLoading(false)
        return
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setMessage('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setPasswordLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="text-center">Please log in to view your profile.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Profile Information
          </h3>
        </div>
          <form onSubmit={handleProfileUpdate} className="p-6.5">
          <div className="mb-6 flex justify-center">
            <AvatarUpload 
              currentAvatarUrl={avatarUrl} 
              onAvatarChange={handleAvatarChange} 
            />
          </div>
          
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Email <span className="text-meta-1">*</span>
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full rounded border-[1.5px] border-stroke bg-gray px-5 py-3 text-black opacity-50 outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
            />
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Email cannot be changed. Contact an administrator if you need to update your email.
            </p>
          </div>

          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>

          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Role
            </label>
            <input
              type="text"
              value={user.role === 'admin' ? 'Administrator' : 'Assistant'}
              disabled
              className="w-full rounded border-[1.5px] border-stroke bg-gray px-5 py-3 text-black opacity-50 outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
            />
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Role is managed by administrators and cannot be changed by users.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Change Password
          </h3>
        </div>
        
        <form onSubmit={handlePasswordUpdate} className="p-6.5">
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Current Password <span className="text-meta-1">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 pr-10 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              New Password <span className="text-meta-1">*</span>
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 characters)"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 pr-10 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2.5 block text-black dark:text-white">
              Confirm New Password <span className="text-meta-1">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 pr-10 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {(message || error) && (
        <div className={`rounded-md p-4 ${
          error ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'
        }`}>
          <div className={`text-sm ${
            error ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'
          }`}>
            {error || message}
          </div>
        </div>
      )}
    </div>
  )
}
