import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import ListingCard from '@/components/ListingCard'
import Reviews from '@/components/Reviews'
import UserAvatar from '@/components/UserAvatar'
import BackButton from '@/components/BackButton'
import { Review } from '@/types/reviews'

const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
const DEFAULT_COVER = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'

interface ListingImage {
  id: number
  image_url: string
}

async function getListing(id: string) {
  const { data: listing, error } = await supabase
    .from('listings')
    .select(`
      *,
      categories (
        id,
        name
      ),
      locations (
        id,
        name
      ),
      listing_images (
        id,
        image_url
      ),
      users (
        id,
        name,
        role,
        profile_picture
      )
    `)
    .eq('id', id)
    .single()

  if (error || !listing) {
    console.error('Error fetching listing:', error)
    return null
  }

  return listing
}

async function getRelatedListings(categoryId: number, currentListingId: number) {
  const { data: listings } = await supabase
    .from('listings')
    .select(`
      id,
      title,
      description,
      price,
      currency,
      created_at,
      categories:categories!inner (
        name
      ),
      locations:locations!inner (
        name
      ),
      listing_images (
        image_url
      ),
      users:users!inner (
        id,
        name,
        role,
        profile_picture
      )
    `)
    .eq('category_id', categoryId)
    .neq('id', currentListingId)
    .limit(5)

  return listings?.map(listing => ({
    ...listing,
    users: Array.isArray(listing.users) ? listing.users[0] : listing.users,
    categories: Array.isArray(listing.categories) ? listing.categories : [listing.categories],
    locations: Array.isArray(listing.locations) ? listing.locations : [listing.locations]
  })) || []
}

async function getListingReviews(listingId: string) {
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      updated_at,
      parent_id,
      reviewer_id,
      seller_id,
      reviewer:users!reviewer_id (
        id,
        name,
        profile_picture,
        role
      )
    `)
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false })
    .returns<Review[]>()

  if (error) {
    console.error('Error fetching reviews:', error)
    return []
  }

  return reviews || []
}

export default async function ListingDetails({
  params
}: {
  params: { id: string }
}) {
  // First, get the main listing and its reviews
  const [listing, reviews] = await Promise.all([
    getListing(params.id),
    getListingReviews(params.id)
  ])

  if (!listing) {
    notFound()
  }

  // Then get related listings using the category_id from the main listing
  const relatedListings = await getRelatedListings(listing.category_id, listing.id)

  const timeAgo = formatDistanceToNow(new Date(listing.created_at), { 
    addSuffix: true,
    includeSeconds: false,
  }).replace('about ', '')

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />

      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4">
        <a href="/" className="hover:text-blue-500">Home</a>
        <span className="mx-2">›</span>
        <a href={`/categories/${listing.category_id}`} className="hover:text-blue-500">
          {listing.categories.name}
        </a>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Seller Info - Moved above cover image */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="mr-3">
                <UserAvatar
                  src={listing.users?.profile_picture || DEFAULT_AVATAR}
                  alt={listing.users?.name || 'User'}
                  size={48}
                />
              </div>
        <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {listing.users?.name || 'User'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {listing.users?.role || 'Member'}
                </p>
              </div>
              <div className="ml-auto flex items-center text-gray-500 dark:text-gray-400">
                <svg 
                  className="w-5 h-5 mr-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <span className="font-medium">{timeAgo}</span>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600 flex items-center gap-2 text-sm font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              See Profile
            </button>
          </div>

          {/* Image Gallery */}
          <div className="mb-6">
            <div className="relative aspect-video mb-4">
              <Image
                src={listing.listing_images[0]?.image_url || DEFAULT_COVER}
                alt={listing.title}
                fill
                className="object-cover rounded-lg"
                priority
                unoptimized={listing.listing_images[0]?.image_url?.includes('supabase.co')}
              />
            </div>
            {listing.listing_images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {listing.listing_images.slice(1).map((image: ListingImage) => (
                  <div key={image.id} className="relative aspect-square">
                    <Image
                      src={image.image_url}
                      alt={listing.title}
                      fill
                      className="object-cover rounded-lg"
                      unoptimized={image.image_url.includes('supabase.co')}
                    />
                  </div>
                ))}
        </div>
            )}
        </div>

          {/* Listing Details */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{listing.title}</h1>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{listing.description}</p>
          </div>

          {/* Reviews Section */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <Reviews
              listingId={parseInt(params.id)}
              initialReviews={reviews}
              sellerId={listing.user_id}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Price and Specifications Card */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 p-6 sticky top-4 divide-y divide-gray-200 dark:divide-gray-700">
            {/* Price Section */}
            <div className="pb-6">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                  {listing.price ? `${listing.currency} ${listing.price.toLocaleString()}` : 'Contact for price'}
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <svg 
                    className="w-5 h-5 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                  <span className="font-medium">{timeAgo}</span>
                </div>
              </div>
            </div>

            {/* Specifications Section */}
            <div className="py-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Specifications</h3>
              <dl className="space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Category</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{listing.categories.name}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Location</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{listing.locations.name}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Listed</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{timeAgo}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">ID</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">#{listing.id}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Status</dt>
                  <dd className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-200">
                    {listing.status}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Action Buttons Section */}
            <div className="pt-6 space-y-3">
              <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Contact Seller
              </button>
              <button className="w-full border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center font-medium">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Save Listing
              </button>
            </div>
            </div>
          </div>
        </div>

      {/* Related Listings */}
      {relatedListings.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Similar Listings</h2>
          <div className="grid grid-cols-5 gap-4">
            {relatedListings.map((relatedListing) => (
              <div key={relatedListing.id} className="w-full">
                <ListingCard 
                  listing={{
                    ...relatedListing,
                    users: Array.isArray(relatedListing.users) 
                      ? relatedListing.users[0] 
                      : relatedListing.users,
                    categories: Array.isArray(relatedListing.categories)
                      ? relatedListing.categories
                      : [relatedListing.categories],
                    locations: Array.isArray(relatedListing.locations)
                      ? relatedListing.locations
                      : [relatedListing.locations]
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
