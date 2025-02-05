import { Ad } from '@/types';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ListingCard from '@/components/ListingCard';

function transformUnsplashUrl(url: string) {
  // Check if it's an Unsplash web URL
  if (url.includes('unsplash.com/photos/')) {
    // Extract the photo ID
    const photoId = url.split('/').pop()?.split('-').pop() || '';
    // Return the CDN format
    return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=800&q=80`;
  }
  return url;
}

const ITEMS_PER_PAGE = 24 // Show more items per page

async function getLatestAds(page = 1) {
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  // First, let's log the total count without any status filter
  const { count: totalCount } = await supabase
    .from('ads')
    .select('*', { count: 'exact', head: true })

  console.log('Total ads in database:', totalCount)

  const { data: ads, error, count } = await supabase
    .from('ads')
    .select(`
      id,
      title,
      description,
      price,
      currency,
      categories (
        name
      ),
      locations (
        name
      ),
      ad_images (
        image_url
      ),
      status
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching ads:', error)
    return { ads: [], totalPages: 0 }
  }

  // Log the fetched ads to see their status
  console.log('Fetched ads:', ads?.map(ad => ({
    id: ad.id,
    title: ad.title,
    status: ad.status
  })))

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE)

  return {
    ads: ads || [],
    totalPages
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: { page: string }
}) {
  const currentPage = Number(searchParams.page) || 1
  const { ads, totalPages } = await getLatestAds(currentPage)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Latest Listings</h1>
      
      {/* Grid of listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {ads.map((ad) => (
          <ListingCard key={ad.id} ad={ad} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 my-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <a
              key={pageNum}
              href={`/?page=${pageNum}`}
              className={`px-4 py-2 rounded-lg ${
                currentPage === pageNum
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {pageNum}
            </a>
          ))}
        </div>
      )}

      {/* No listings message */}
      {ads.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          No listings found. Be the first to post one!
        </div>
      )}
    </div>
  )
}
