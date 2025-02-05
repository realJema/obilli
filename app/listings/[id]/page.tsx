import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Ad } from '@/types';

async function getListingById(id: string) {
  const { data: listing } = await supabase
    .from('ads')
    .select(`
      *,
      user:users(*),
      category:categories(*),
      location:locations(*),
      images:ad_images(*)
    `)
    .eq('id', id)
    .single();

  return listing as (Ad & {
    user: Ad['user'];
    category: Ad['category'];
    location: Ad['location'];
    images: Ad['images'];
  }) | null;
}

export default async function ListingPage({
  params,
}: {
  params: { id: string };
}) {
  const listing = await getListingById(params.id);

  if (!listing) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Images */}
        <div className="aspect-w-3 aspect-h-2 bg-gray-200 rounded-lg overflow-hidden">
          {listing.images && listing.images.length > 0 ? (
            <img
              src={listing.images[0].image_url}
              alt={listing.title}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>

        {/* Title and main info */}
        <div>
          <h1 className="text-3xl font-bold">{listing.title}</h1>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-2xl font-bold text-indigo-600">
              {listing.price ? `${listing.currency} ${listing.price.toFixed(2)}` : 'Contact for price'}
            </p>
            <p className="text-sm text-gray-500">
              Posted {new Date(listing.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-lg font-semibold">Description</h2>
          <p className="mt-2 text-gray-600 whitespace-pre-wrap">{listing.description}</p>
        </div>

        {/* Location and Category */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold">Location</h2>
            <p className="mt-2 text-gray-600">{listing.location?.name}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Category</h2>
            <p className="mt-2 text-gray-600">{listing.category?.name}</p>
          </div>
        </div>

        {/* Seller info */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold">Seller Information</h2>
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex-shrink-0">
              {listing.user?.profile_picture ? (
                <img
                  src={listing.user.profile_picture}
                  alt={listing.user.name}
                  className="h-12 w-12 rounded-full"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-200" />
              )}
            </div>
            <div>
              <p className="font-medium">{listing.user?.name}</p>
              <p className="text-sm text-gray-500">Member since {new Date(listing.user?.created_at || '').toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Contact button */}
        <div className="border-t pt-6">
          <button
            type="button"
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Contact Seller
          </button>
        </div>
      </div>
    </div>
  );
}
