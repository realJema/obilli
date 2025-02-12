// import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ListingCard from '@/components/ListingCard';
import CategorySection from '@/components/CategorySection';
import HeroSection from '@/components/HeroSection'

// Add interface for the listing type
interface Listing {
  id: number
  title: string
  description?: string
  price?: number | null
  currency?: string
  created_at: string
  categories: { name: string }[]
  locations: { name: string }[]
  listing_images?: { image_url: string }[]
  users: {
    id: number
    name: string | null
    profile_picture: string | null
    role: string | null
  }
}

// Add interface for category with listings
interface CategoryWithListings {
  id: number
  name: string
  description?: string
  listings: Listing[]
}

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

  const { count: totalCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })

  const { data: listings, error, count } = await supabase
    .from('listings')
    .select(`
      *,
      users:users!inner (
        id,
        name,
        profile_picture,
        role
      )
    `)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching listings:', error)
    return { ads: [], totalPages: 0 }
  }

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE)

  // Transform the listings data
  const transformedListings = listings?.map((listing: any) => ({
    ...listing,
    users: listing.users || {
      id: 0,
      name: 'Anonymous',
      profile_picture: null,
      role: 'Member'
    }
  })) || []

  return {
    ads: transformedListings,
    totalPages
  }
}

async function getMainCategoriesWithListings() {
  // Get main categories (those without parent_id), limited to 5
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .is('parent_id', null)
    .order('name')  // Or any other ordering you prefer
    .limit(5)  // Limit to 5 main categories

  const categoriesWithListings = await Promise.all(
    categories?.map(async (category) => {
      // First get all subcategories for this main category
      const { data: subcategories } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', category.id)

      // Create array of category IDs including main category and all subcategories
      const categoryIds = [
        category.id,
        ...(subcategories?.map(sub => sub.id) || [])
      ]

      // Get listings from main category and all its subcategories
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select(`
          *,
          users:users!inner (
            id,
            name,
            profile_picture,
            role
          )
        `)
        .in('category_id', categoryIds)
        .order('created_at', { ascending: false })
        .limit(10)

      if (listingsError) {
        console.error(`Error fetching listings for category ${category.id}:`, listingsError)
        return { ...category, listings: [] }
      }

      // Transform the listings data
      const transformedListings = listings?.map((listing: any) => ({
        ...listing,
        users: listing.users || {
          id: 0,
          name: 'Anonymous',
          profile_picture: null,
          role: 'Member'
        }
      })) || []

      return {
        ...category,
        listings: transformedListings
      }
    }) || []
  )

  return categoriesWithListings
}

function mapListingData(data: any) {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    price: data.price,
    currency: data.currency,
    created_at: data.created_at,
    categories: data.categories,
    locations: data.locations,
    listing_images: data.listing_images,
    users: {
      id: data.users?.id,
      name: data.users?.name || 'Anonymous',
      profile_picture: data.users?.profile_picture,
      role: data.users?.role || 'Member'
    }
  }
}

export default async function Home() {
  const categoriesWithListings = await getMainCategoriesWithListings()

  return (
    <>
      <HeroSection />
      <div className="space-y-12">
        {categoriesWithListings.map((category: CategoryWithListings) => (
          <CategorySection 
            key={category.id}
            category={category.name}
            description={category.description}
          >
            {category.listings.map((listing: Listing) => (
              <ListingCard 
              key={listing.id} 
                listing={listing}
              />
            ))}
          </CategorySection>
        ))}
      </div>
    </>
  )
}
