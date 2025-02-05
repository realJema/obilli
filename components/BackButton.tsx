'use client'

import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()

  return (
    <button 
      onClick={() => router.back()}
      className="flex items-center text-gray-600 hover:text-gray-900 mb-4 group"
    >
      <svg 
        className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M10 19l-7-7m0 0l7-7m-7 7h18" 
        />
      </svg>
      Back to listings
    </button>
  )
} 
