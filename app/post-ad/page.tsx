import { supabase } from '@/lib/supabase';
import { Category, Location } from '@/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function getCategories() {
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  return categories as Category[];
}

async function getLocations() {
  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .order('name');
  return locations as Location[];
}

export default async function PostAdPage() {
  const categories = await getCategories();
  const locations = await getLocations();

  async function createAd(formData: FormData) {
    'use server';

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') ? parseFloat(formData.get('price') as string) : null;
    const categoryId = parseInt(formData.get('category') as string);
    const locationId = parseInt(formData.get('location') as string);

    // In a real app, you'd get the user_id from the session
    const userId = 1; // Temporary placeholder

    const { data: ad, error } = await supabase
      .from('ads')
      .insert({
        title,
        description,
        price,
        category_id: categoryId,
        location_id: locationId,
        user_id: userId,
        status: 'pending',
        currency: 'USD', // You might want to make this configurable
      })
      .select()
      .single();

    if (error) {
      throw new Error('Failed to create ad');
    }

    revalidatePath('/');
    redirect(`/listings/${ad.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Post a New Ad</h1>

      <form action={createAd} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={4}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price (USD)
          </label>
          <input
            type="number"
            name="price"
            id="price"
            step="0.01"
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            name="category"
            id="category"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <select
            name="location"
            id="location"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select a location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Post Ad
          </button>
        </div>
      </form>
    </div>
  );
}
