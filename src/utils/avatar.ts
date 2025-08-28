/**
 * Utility to handle avatar URLs and provide a fallback
 */

import { useState, useEffect } from 'react';

/**
 * Check if an image URL is valid
 */
export function useAvatarUrl(url: string | null) {
  const [validUrl, setValidUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setValidUrl(null);
      setIsLoading(false);
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      setValidUrl(url);
      setIsLoading(false);
      setError(null);
    };
    
    img.onerror = () => {
      setValidUrl(null);
      setIsLoading(false);
      setError('Failed to load image');
    };
    
    img.src = url;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [url]);

  return { url: validUrl, isLoading, error };
}

/**
 * Generate initials from a name for avatar fallback
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}
