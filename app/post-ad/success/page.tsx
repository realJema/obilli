'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

export default function ListingSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const listingId = searchParams.get('id')

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="text-center space-y-6 max-w-xl">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircleIcon className="w-10 h-10 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Listing Created Successfully!
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400">
          Your listing has been created and is now pending review.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 text-lg font-medium text-brand-600 border-2 border-brand-600 rounded-xl hover:bg-brand-50 transition-colors"
          >
            Return Home
          </button>
          
          <button
            onClick={() => router.push(`/listings/${listingId}`)}
            className="px-8 py-3 text-lg font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors"
          >
            View Listing
          </button>

          <button
            onClick={() => router.push('/post-ad')}
            className="px-8 py-3 text-lg font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors"
          >
            Create Another Listing
          </button>
        </div>
      </div>
    </div>
  )
} 
