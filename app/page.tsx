import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ListingCard from '@/components/ListingCard';
import CategorySection from '@/components/CategorySection';
import HeroSection from '@/components/HeroSection'

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

  // First, let's log the total count
  const { count: totalCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })

  console.log('Total listings in database:', totalCount)

  const { data: listings, error, count } = await supabase
    .from('listings')
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
      listing_images (
        image_url
      ),
      status
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching listings:', error)
    return { ads: [], totalPages: 0 }
  }

  console.log('Fetched listings:', listings?.map(listing => ({
    id: listing.id,
    title: listing.title,
    status: listing.status
  })))

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE)

  return {
    ads: listings || [], // Keep the name 'ads' for now to avoid changing the component props
    totalPages
  }
}

async function getMainCategoriesWithListings() {
  // Get main categories (those without parent_id)
  const { data: mainCategories, error: categoryError } = await supabase
    .from('categories')
    .select('id, name, description')
    .is('parent_id', null)
    .limit(5)

  if (categoryError) {
    console.error('Error fetching categories:', categoryError)
    return []
  }

  // For each main category, get its listings
  const categoriesWithListings = await Promise.all(
    mainCategories.map(async (category) => {
      // First, get all subcategory IDs for this main category
      const { data: subcategories } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', category.id)

      // Create array of category IDs including main category and all its subcategories
      const categoryIds = [category.id, ...(subcategories?.map(sub => sub.id) || [])]

      // Get listings from main category and all its subcategories
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          description,
          price,
          currency,
          created_at,
          categories (
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
        .order('created_at', { ascending: false })
        .limit(10)

      if (listingsError) {
        console.error(`Error fetching listings for category ${category.id}:`, listingsError)
        return { ...category, listings: [] }
      }

      // Transform the data to match our expected format
      const transformedListings = listings?.map(listing => ({
        ...listing,
        user: listing.users // Rename users to user
      })) || []

      // Log for debugging
      console.log(`Category ${category.name}:`, {
        categoryIds,
        listingsCount: transformedListings?.length || 0
      })

      return {
        ...category,
        listings: transformedListings
      }
    })
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
    user: data.users  // Map users to user
  }
}

export default async function Home() {
  const categoriesWithListings = await getMainCategoriesWithListings()

  return (
    <>
      <HeroSection />
      <div className="space-y-12">
        {categoriesWithListings.map((category) => (
          <CategorySection 
            key={category.id}
            category={category.name}
            description={category.description}
          >
            {category.listings.slice(0, 10).map((listing) => (
              <ListingCard 
                key={listing.id}
                listing={mapListingData(listing)}
              />
            ))}
          </CategorySection>
        ))}
      </div>
    </>
  )
}
