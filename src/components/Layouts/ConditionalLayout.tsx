'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/Layouts/sidebar'
import { Header } from '@/components/Layouts/header'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Check if current path is an auth route
  const isAuthPage = pathname?.startsWith('/auth')
  
  if (isAuthPage) {
    // Render without sidebar and header for auth pages
    return (
      <div className="min-h-screen bg-gray-2 dark:bg-[#020d1a]">
        {children}
      </div>
    )
  }
  
  // Render with sidebar and header for all other pages
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
        <Header />
        <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 pb-0">
          {children}
        </main>
      </div>
    </div>
  )
}
