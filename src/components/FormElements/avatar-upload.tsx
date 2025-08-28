'use client'

import { useState, useRef, ChangeEvent, useEffect } from 'react'
import Image from 'next/image'
import { Camera, X, User } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAvatarUrl, getInitials } from '@/utils/avatar'

type AvatarUploadProps = {
  currentAvatarUrl: string | null
  onAvatarChange: (url: string) => void
}

export function AvatarUpload({ currentAvatarUrl, onAvatarChange }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl)
  const { url: validatedUrl, isLoading } = useAvatarUrl(previewUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    try {
      setIsUploading(true)

      // Create form data for upload
      const formData = new FormData()
      formData.append('avatar', file)

      // Upload to API
      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload avatar')
      }

      const result = await response.json()
      
      // Update with the actual URL from the server
      onAvatarChange(result.avatarUrl)
      toast.success('Profile picture updated successfully')
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      setPreviewUrl(currentAvatarUrl) // Revert to previous avatar on error
      toast.error(error.message || 'Failed to upload avatar')
    } finally {
      setIsUploading(false)
    }
  }
  const handleRemoveAvatar = async () => {
    try {
      setIsUploading(true)
      
      // Call API to remove avatar
      const response = await fetch('/api/profile/avatar/remove', {
        method: 'POST',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove avatar')
      }
      
      // Clear preview and update parent component
      setPreviewUrl(null)
      onAvatarChange('')
      toast.success('Profile picture removed')
    } catch (error: any) {
      console.error('Error removing avatar:', error)
      toast.error(error.message || 'Failed to remove avatar')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="relative">      <div 
        className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-stroke dark:border-strokedark bg-gray dark:bg-form-input cursor-pointer group"
        onClick={handleAvatarClick}
      >
        {validatedUrl ? (
          <Image 
            src={validatedUrl} 
            alt="Profile avatar" 
            className="object-cover"
            fill
            sizes="96px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            <User className="h-12 w-12 text-gray-400 dark:text-gray-500" />
          </div>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 dark:bg-gray-800 dark:bg-opacity-60">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}
        
        {/* Overlay with camera icon */}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="text-white h-8 w-8" />
        </div>
      </div>

      {/* Remove button appears when an avatar is present */}
      {previewUrl && (
        <button 
          type="button"
          className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 text-white"
          onClick={handleRemoveAvatar}
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
      />

      {/* Loading indicator */}
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 dark:bg-black dark:bg-opacity-70 rounded-full">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  )
}
