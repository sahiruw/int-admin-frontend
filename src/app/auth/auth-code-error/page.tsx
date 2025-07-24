'use client'

import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-auto">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              TAROKOI Admin
            </h2>
          </div>
          <h2 className="mt-6 text-center text-xl text-red-600 dark:text-red-400">
            Authentication Error
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            There was an error processing your authentication request. This could happen if:
          </p>
          <ul className="mt-4 text-left text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li>• The authentication link has expired</li>
            <li>• The link has already been used</li>
            <li>• There was a server error</li>
          </ul>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/auth/login"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Back to Sign In
          </Link>
          
          <Link
            href="/auth/forgot-password"
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Reset Password
          </Link>
        </div>
      </div>
    </div>
  )
}
