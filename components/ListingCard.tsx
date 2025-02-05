'use client'

import Image from 'next/image'
import Link from 'next/link'

interface ListingCardProps {
  ad: {
    id: number
    title: string
    price: number | null
    currency: string
    categories: { name: string }
    locations: { name: string }
    ad_images: { image_url: string }[]
  }
}

export default function ListingCard({ ad }: ListingCardProps) {
  // Use a reliable placeholder with correct CDN URL format
  const mainImage = ad.ad_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'

  return (
    <Link href={`/listings/${ad.id}`}>
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48">
          <Image
            src={mainImage}
            alt={ad.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={mainImage.includes('supabase.co')} // Skip optimization for Supabase URLs
          />
        </div>
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">{ad.title}</h2>
          <p className="text-xl font-bold text-green-600">
            {ad.price ? `${ad.currency} ${ad.price.toLocaleString()}` : 'Contact for price'}
          </p>
          <div className="mt-2 text-sm text-gray-600">
            <p>{ad.categories.name}</p>
            <p>{ad.locations.name}</p>
          </div>
        </div>
      </div>
    </Link>
  )
} 
