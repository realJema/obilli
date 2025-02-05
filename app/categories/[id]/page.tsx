import { supabase } from '@/lib/supabase'
import ListingCard from '@/components/ListingCard'
import FilterSidebar from '@/components/FilterSidebar'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import SortSelect from '@/components/SortSelect'

async function getCategoryWithListings(categoryId: string, options: {
  page: number
  limit: number
  locationId?: string
  dateFilter?: string
  minPrice?: string
  maxPrice?: string
  sortBy?: string
}) {
  const { page, limit, locationId, dateFilter, minPrice, maxPrice, sortBy } = options
  const offset = (page - 1) * limit

  // Get the category info
  const { data: category } = await supabase
    .from('categories')
    .select('*, parent:parent_id(name)')
    .eq('id', categoryId)
    .single()

  if (!category) return null

  // Get subcategories
  const { data: subcategories } = await supabase
    .from('categories')
    .select('id, name, description')
    .eq('parent_id', categoryId)

  // Get all category IDs to include
  const categoryIds = [
    parseInt(categoryId),
    ...(subcategories?.map(sub => sub.id) || [])
  ]

  // Build the query
  let query = supabase
    .from('listings')
    .select(`
      id,
      title,
      description,
      price,
      currency,
      created_at,
      category_id,
      categories (
        id,
        name
      ),
      locations (
        name
      ),
      listing_images (
        image_url
      ),
      users (
        name,
        role,
        profile_picture
      )
    `, { count: 'exact' })
    .in('category_id', categoryIds)

  // Apply filters
  if (locationId) {
    query = query.eq('location_id', locationId)
  }

  if (dateFilter) {
    const now = new Date()
    let dateLimit: Date
    switch (dateFilter) {
      case 'today':
        dateLimit = new Date(now.setHours(0, 0, 0, 0))
        break
      case 'week':
        dateLimit = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        dateLimit = new Date(now.setMonth(now.getMonth() - 1))
        break
      default:
        dateLimit = new Date(0)
    }
    query = query.gte('created_at', dateLimit.toISOString())
  }

  if (minPrice) {
    query = query.gte('price', minPrice)
  }

  if (maxPrice) {
    query = query.lte('price', maxPrice)
  }

  // Apply sorting
  switch (sortBy) {
    case 'price_low':
    case 'price_high': {
      // Get total count first
      const { count: totalCount } = await query
        .select('id', { count: 'exact', head: true })

      // First get listings with prices
      const { data: pricedListings = [] } = await query
        .not('price', 'is', null)
        .order('price', { ascending: sortBy === 'price_low' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      // Then get listings without prices
      const { data: unpricedListings = [] } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          description,
          price,
          currency,
          created_at,
          category_id,
          categories (
            id,
            name
          ),
          locations (
            name
          ),
          listing_images (
            image_url
          ),
          users (
            name,
            role,
            profile_picture
          )
        `)
        .in('category_id', categoryIds)
        .is('price', null)
        .order('created_at', { ascending: false })
        .range(0, limit - pricedListings.length - 1)

      // Combine the results
      return {
        category,
        listings: [...pricedListings, ...unpricedListings],
        totalCount: totalCount || 0
      }
    }
    case 'oldest':
      const { data: oldListings, count: oldCount } = await query
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1)
      return {
        category,
        listings: oldListings || [],
        totalCount: oldCount || 0
      }
    default: // newest first
      const { data: newListings, count: newCount } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      return {
        category,
        listings: newListings || [],
        totalCount: newCount || 0
      }
  }
}

async function getLocations() {
  const { data: locations } = await supabase
    .from('locations')
    .select('id, name')
    .order('name')

  return locations || []
}

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: { id: string }
  searchParams: { [key: string]: string | undefined }
}) {
  // First, check if the category exists
  const { data: category } = await supabase
    .from('categories')
    .select('*, parent:parent_id(name)')
    .eq('id', params.id)
    .single()

  if (!category) {
    notFound() // Only show 404 if category doesn't exist
  }

  const page = parseInt(searchParams.page || '1')
  const limit = 12

  // Get listings and locations in parallel
  const [listingsData, locations] = await Promise.all([
    getCategoryWithListings(params.id, {
      page,
      limit,
      locationId: searchParams.location,
      dateFilter: searchParams.date,
      minPrice: searchParams.minPrice,
      maxPrice: searchParams.maxPrice,
      sortBy: searchParams.sort
    }),
    getLocations()
  ])
  
  // Use empty arrays as fallback if no listings found
  const listings = listingsData?.listings || []
  const totalCount = listingsData?.totalCount || 0
  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Header */}
      <div className="mb-8">
        <div className="text-sm text-gray-500 mb-2">
          <Link href="/" className="hover:text-blue-500">Home</Link>
          <span className="mx-2">›</span>
          <span>{category.name}</span>
        </div>
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600 mt-2 max-w-3xl">{category.description}</p>
        )}
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <div className="w-64 flex-shrink-0">
          <FilterSidebar 
            currentCategoryId={parseInt(params.id)}
            searchParams={searchParams}
            locations={locations}
          />
        </div>

        {/* Listings Grid */}
        <div className="flex-grow">
          <div className="mb-6">
            <SortSelect totalCount={totalCount} />
          </div>

          {listings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {listings.map((listing) => (
                  <ListingCard 
                    key={listing.id} 
                    listing={{
                      ...listing,
                      user: listing.users,
                      categories: listing.categories || { name: 'Uncategorized' },
                      locations: listing.locations || { name: 'Location not specified' }
                    }}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex space-x-2">
                    {page > 1 && (
                      <Link
                        href={{ query: { ...searchParams, page: page - 1 } }}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        Previous
                      </Link>
                    )}
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <Link
                        key={i + 1}
                        href={{ query: { ...searchParams, page: i + 1 } }}
                        className={`px-4 py-2 border rounded-lg ${
                          page === i + 1
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </Link>
                    ))}

                    {page < totalPages && (
                      <Link
                        href={{ query: { ...searchParams, page: page + 1 } }}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        Next
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg 
                  className="w-16 h-16 mx-auto mb-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
                  />
                </svg>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No listings found
                </h3>
                <p className="text-gray-500">
                  There are currently no listings in this category.
                  {Object.keys(searchParams).length > 0 && (
                    <>
                      <br />
                      Try adjusting your filters or{' '}
                      <Link 
                        href={`/categories/${params.id}`}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        clear all filters
                      </Link>
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
