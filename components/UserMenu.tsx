'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'
import Link from 'next/link'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import AuthModal from './AuthModal'
import { DEFAULT_IMAGES } from '@/lib/constants'

export default function UserMenu() {
  const { user, signOut } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  
  // Make the ref type more specific
  const dropdownRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLDivElement>

  useOnClickOutside(dropdownRef, () => setShowDropdown(false))

  // Close dropdown when user signs out
  useEffect(() => {
    if (!user) {
      setShowDropdown(false)
    }
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
      setShowDropdown(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="px-6 py-3 text-lg font-medium text-white bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 rounded-lg transition-colors"
        >
          Sign In
        </button>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    )
  }

  const metadata = user.user_metadata || {}
  const displayName = metadata.name || user.email?.split('@')[0] || 'User'
  const profilePicture = metadata.profile_picture || DEFAULT_IMAGES.AVATAR

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 focus:outline-none group"
      >
        <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-brand-500 transition-all">
          <Image
            src={profilePicture}
            alt={displayName}
            fill
            className="object-cover"
            sizes="40px"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = DEFAULT_IMAGES.AVATAR;
            }}
          />
        </div>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg py-1 border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {displayName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setShowDropdown(false)}
          >
            Profile
          </Link>
          <Link
            href="/my-listings"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setShowDropdown(false)}
          >
            My Listings
          </Link>
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
} 
