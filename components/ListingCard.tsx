'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface ListingCardProps {
  listing: {
    id: number
    title?: string
    description?: string
    price?: number | null
    currency?: string
    created_at?: string
    categories?: { name: string }
    locations?: { name: string }
    listing_images?: { image_url: string }[]
    user?: {
      name: string
      role: string
      profile_picture?: string
    }
  }
}

export default function ListingCard({ listing }: ListingCardProps) {
  // Add safety check for listing_images
  const mainImage = listing?.listing_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
  
  // Add safety check for date and customize the format
  const timeAgo = listing?.created_at 
    ? formatDistanceToNow(new Date(listing.created_at), { 
        addSuffix: true,
        includeSeconds: false,
      }).replace('about ', '')
      .replace('less than a minute ago', 'just now')
    : 'Recently'

  // Add safety check for user data
  const user = listing?.user || {
    name: 'Anonymous',
    role: 'user',
    profile_picture: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
  }

  const defaultAvatar = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'

  // Add safety checks for category and location
  const categoryName = listing?.categories?.name || 'Uncategorized'
  const locationName = listing?.locations?.name || 'Location not specified'

  if (!listing) {
    return null // Or return a placeholder card
  }

  return (
    <Link href={`/listings/${listing.id}`}>
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow h-[24rem] flex flex-col">
        <div className="relative h-40 flex-shrink-0">
          <Image
            src={mainImage}
            alt={listing.title || 'Listing Image'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={mainImage.includes('supabase.co')} // Skip optimization for Supabase URLs
          />
        </div>
        <div className="p-3 flex flex-col flex-grow">
          {/* User info and date */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="relative w-7 h-7 rounded-full overflow-hidden mr-2 bg-gray-100">
                <Image
                  src={user.profile_picture || defaultAvatar}
                  alt={user.name}
                  fill
                  className="object-cover"
                  sizes="28px"
                  unoptimized={process.env.NODE_ENV === 'development'}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = defaultAvatar;
                  }}
                />
              </div>
              <div>
                <p className="text-sm font-medium truncate max-w-[120px]">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0">{timeAgo}</span>
          </div>

          {/* Title and description */}
          <div className="flex-grow">
            <h2 className="text-base font-semibold mb-1 line-clamp-2">{listing.title || 'Untitled Listing'}</h2>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {listing.description || 'No description available'}
            </p>
          </div>

          {/* Footer info - always at bottom */}
          <div className="mt-auto">
            {/* Price */}
            <p className="text-lg font-bold text-brand-600 dark:text-brand-400 mb-1">
              {listing.price ? `${listing.currency} ${listing.price.toLocaleString()}` : 'Contact for price'}
            </p>

            {/* Category and location */}
            <div className="text-xs text-gray-600">
              <p className="truncate">{categoryName}</p>
              <p className="truncate">{locationName}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
} 
