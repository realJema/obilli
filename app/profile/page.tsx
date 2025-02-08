'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ListingCard from '@/components/ListingCard'
import { DEFAULT_IMAGES } from '@/lib/constants'
import ProfileSkeleton from '@/components/ProfileSkeleton'

interface UserProfile {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: string
  bio: string | null
  profile_picture: string | null
  created_at: string
}

interface UserListing {
  id: number
  title: string
  price: number
  currency: string
  status: string
  created_at: string
  listing_images: { image_url: string }[]
  categories: { name: string }
  locations: { name: string }
  users: {
    name: string
    profile_picture: string | null
    role: string
  } | null
}

const ITEMS_PER_PAGE = 8

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [listings, setListings] = useState<UserListing[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalListings, setTotalListings] = useState(0)

  useEffect(() => {
    if (!user) return

    // Initial load of profile data
    const metadata = user.user_metadata || {}
    setProfile({
      id: user.id,
      email: user.email || '',
      name: metadata.name || null,
      phone: metadata.phone || null,
      bio: metadata.bio || null,
      profile_picture: metadata.profile_picture || null,
      role: metadata.role || 'user',
      created_at: user.created_at
    })

    // Load initial data
    loadProfile()

    // Set up real-time subscription for listings
    const listingsSubscription = supabase
      .channel('listings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'listings',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadProfile()
        }
      )
      .subscribe()

    // Set up subscription for user metadata changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'USER_UPDATED' || event === 'SIGNED_IN') && session?.user) {
        const metadata = session.user.user_metadata || {}
        setProfile({
          id: session.user.id,
          email: session.user.email || '',
          name: metadata.name || null,
          phone: metadata.phone || null,
          bio: metadata.bio || null,
          profile_picture: metadata.profile_picture || null,
          role: metadata.role || 'user',
          created_at: session.user.created_at
        })
      }
    })

    return () => {
      listingsSubscription.unsubscribe()
      subscription.unsubscribe()
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [currentPage, user])

  async function loadProfile() {
    if (!user) return

    try {
      // First get the user's ID from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (userError) throw userError

      // Get total count of listings
      const { count: totalCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userData.id)

      setTotalListings(totalCount || 0)

      // Then get user's listings using the correct user_id with pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          description,
          price,
          currency,
          status,
          created_at,
          listing_images (image_url),
          categories (name),
          locations (name),
          users:user_id (
            name,
            profile_picture,
            role
          )
        `)
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (listingsError) throw listingsError

      // Transform the data to match the ListingCard expectations
      const transformedListings = listings?.map(listing => ({
        ...listing,
        description: listing.description || 'No description available',
        users: listing.users || {
          name: user.user_metadata.name || user.email?.split('@')[0] || 'User',
          profile_picture: user.user_metadata.profile_picture,
          role: user.user_metadata.role || 'user'
        }
      })) || []

      setListings(transformedListings)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user || loading) {
    return <ProfileSkeleton />
  }

  const totalPages = Math.ceil(totalListings / ITEMS_PER_PAGE)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start gap-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden">
              <Image
                src={profile?.profile_picture || DEFAULT_IMAGES.AVATAR}
                alt={profile?.name || user.email || ''}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = DEFAULT_IMAGES.AVATAR;
                }}
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {profile?.name || 'No name set'}
                  </h1>
                  <div className="space-y-2 mb-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      {profile?.bio || 'No bio yet'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Email:</span> {user.email}
                    </p>
                    {profile?.phone && (
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Phone:</span> {profile.phone}
                      </p>
                    )}
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Role:</span>{' '}
                      <span className="capitalize">{profile?.role || 'user'}</span>
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Member since {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href="/settings"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* User's Listings */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            My Listings ({totalListings})
          </h2>
          {listings.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                {listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={{
                      ...listing,
                      user: {
                        name: user.email || '',
                        role: 'user',
                        profile_picture: profile?.profile_picture || undefined
                      }
                    }}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">
                You haven&apos;t posted any listings yet.
              </p>
              <Link
                href="/post-ad"
                className="inline-block mt-4 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors"
              >
                Post Your First Listing
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
