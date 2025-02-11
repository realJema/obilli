'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const listingId = searchParams?.get('id')

  if (!listingId) {
    router.push('/')
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-4">
          Listing Created Successfully!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Your listing has been created and is now pending review. We'll notify you once it's approved.
        </p>
        <div className="space-y-4">
          <Link
            href={`/listings/${listingId}`}
            className="block w-full bg-brand-600 text-white py-3 px-4 rounded-lg hover:bg-brand-700 transition-colors"
          >
            View Listing
          </Link>
          <Link
            href="/"
            className="block w-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
} 
