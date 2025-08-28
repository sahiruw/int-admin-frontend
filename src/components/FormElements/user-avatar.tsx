'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { User } from 'lucide-react'
import { useAvatarUrl, getInitials } from '@/utils/avatar'

type UserAvatarProps = {
  url: string | null
  name?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function UserAvatar({ url, name, size = 'md', className = '' }: UserAvatarProps) {
  // Validate the URL and handle loading state
  const { url: validUrl, isLoading } = useAvatarUrl(url)
  
  // Determine size classes based on size prop
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }
  
  // Get initials for fallback display
  const initials = getInitials(name)
  
  return (
    <div className={`relative rounded-full overflow-hidden ${sizeClasses[size]} ${className}`}>
      {validUrl ? (
        <Image 
          src={validUrl}
          alt={name || 'User avatar'}
          fill
          className="object-cover"
          sizes={`${size === 'sm' ? '32px' : size === 'md' ? '40px' : '64px'}`}
        />
      ) : (
        <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {name ? (
            <span className={`font-medium ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`}>
              {initials}
            </span>
          ) : (
            <User className={size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-8 w-8'} />
          )}
        </div>
      )}
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 dark:bg-gray-800 dark:bg-opacity-60">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  )
}
