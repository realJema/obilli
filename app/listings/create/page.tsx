'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { uploadImage } from '@/lib/supabase-storage'

interface Category {
  id: number
  name: string
  parent_id: number | null
}

interface Location {
  id: number
  name: string
  parent_id: number | null
  type: string
}

interface FormData {
  title: string
  description: string
  price: number
  currency: string
  category_id: number
  location_id: number
  images: File[]
}

export default function CreateListing() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: 0,
    currency: 'USD',
    category_id: 0,
    location_id: 0,
    images: []
  })

  // Fetch categories and locations on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [categoriesRes, locationsRes] = await Promise.all([
          supabase.from('categories').select('*').order('name'),
          supabase.from('locations').select('*').order('name')
        ])

        if (categoriesRes.error) throw categoriesRes.error
        if (locationsRes.error) throw locationsRes.error

        setCategories(categoriesRes.data || [])
        setLocations(locationsRes.data || [])
      } catch (error) {
        console.error('Error fetching data:', error)
        alert('Error loading form data. Please refresh the page.')
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form data
      if (!formData.category_id || !formData.location_id) {
        throw new Error('Please select a category and location')
      }

      if (formData.images.length === 0) {
        throw new Error('Please upload at least one image')
      }

      if (formData.images.length > 10) {
        throw new Error('Maximum 10 images allowed')
      }

      // 1. Upload images and get URLs
      const imageUrls = []
      for (const file of formData.images) {
        try {
          const url = await uploadImage(file, 'listings')
          imageUrls.push(url)
        } catch (error) {
          console.error('Error uploading image:', error)
          throw new Error(`Failed to upload image ${file.name}`)
        }
      }

      if (imageUrls.length === 0) {
        throw new Error('Failed to upload any images')
      }

      // 2. Create the ad with minimal fields
      const { data: ad, error: adError } = await supabase
        .from('ads')
        .insert({
          title: formData.title,
          description: formData.description,
          price: formData.price,
          currency: formData.currency,
          category_id: formData.category_id,
          location_id: formData.location_id,
          user_id: 1,
          status: 'pending',
          views_count: 0
        })
        .select('id')
        .single()

      if (adError) {
        console.error('Error creating ad:', {
          error: adError,
          message: adError.message,
          details: adError.details,
          hint: adError.hint,
          code: adError.code,
          query: adError.query
        })
        throw new Error(`Failed to create listing: ${adError.message}`)
      }

      if (!ad?.id) {
        throw new Error('No ad ID returned after creation')
      }

      // 3. Create image records one by one to avoid conflicts
      try {
        for (const url of imageUrls) {
          const { error: imageError } = await supabase
            .from('ad_images')
            .insert({
              ad_id: ad.id,
              image_url: url,
              created_at: new Date().toISOString()
            })
            .select('id')
            .single()

          if (imageError) {
            // Log the full error details
            console.error('Error creating image record:', {
              error: imageError,
              message: imageError.message,
              details: imageError.details,
              hint: imageError.hint,
              code: imageError.code,
              url: url,
              ad_id: ad.id
            })

            // Clean up the ad and storage
            await Promise.all([
              supabase.from('ads').delete().eq('id', ad.id),
              supabase.storage.from('ads').remove([url.split('/').pop() || ''])
            ])

            throw new Error(`Failed to save image information: ${imageError.message}`)
          }
        }
      } catch (error) {
        // Clean up the ad and storage if anything fails
        await Promise.all([
          supabase.from('ads').delete().eq('id', ad.id),
          ...imageUrls.map(url => 
            supabase.storage.from('ads').remove([url.split('/').pop() || ''])
          )
        ])
        throw error
      }

      router.push(`/listings/${ad.id}`)
    } catch (error) {
      console.error('Error creating listing:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      alert(error instanceof Error ? error.message : 'Error creating listing. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validate files
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 5MB`)
        return false
      }
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image`)
        return false
      }
      return true
    })

    if (validFiles.length > 10) {
      alert('Maximum 10 images allowed')
      validFiles.length = 10
    }

    setFormData(prev => ({ ...prev, images: validFiles }))
  }

  const validateStep = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        if (!formData.title.trim()) {
          alert('Please enter a title')
          return false
        }
        if (!formData.description.trim()) {
          alert('Please enter a description')
          return false
        }
        if (formData.price <= 0) {
          alert('Please enter a valid price')
          return false
        }
        return true

      case 2:
        if (!formData.category_id) {
          alert('Please select a category')
          return false
        }
        if (!formData.location_id) {
          alert('Please select a location')
          return false
        }
        return true

      default:
        return true
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Create New Listing</h1>

      <div className="mb-8">
        <div className="flex justify-between items-center">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`w-1/3 h-2 rounded-full ${
                step >= num ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                required
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <select
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.location_id}
                onChange={(e) => setFormData({ ...formData, location_id: parseInt(e.target.value) })}
              >
                <option value="">Select a location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                required
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                onChange={handleFileChange}
              />
              <p className="mt-2 text-sm text-gray-500">
                You can upload up to 10 images. Each image must be less than 5MB.
                Supported formats: JPG, PNG, GIF
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {formData.images.length > 0 && Array.from(formData.images).map((file, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="rounded-lg object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = Array.from(formData.images)
                      newImages.splice(index, 1)
                      setFormData(prev => ({ ...prev, images: newImages }))
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Previous
            </button>
          )}
          
          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (validateStep(step)) {
                  setStep(step + 1)
                }
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Listing'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
} 
