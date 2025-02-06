'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import ImageUpload from '@/components/ImageUpload'
import { toast } from 'react-hot-toast'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid'

interface Category {
  id: number
  name: string
  parent_id: number | null
}

interface Location {
  id: number
  name: string
  parent_id: number | null
}

interface FormData {
  title: string
  description: string
  price: string
  currency: string
  category_id: string
  location_id: string
}

export default function PostAdPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    category_id: '',
    location_id: '',
  })

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Please Sign In</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">You need to be signed in to post a listing</p>
        <button
          onClick={() => router.push('/auth')}
          className="bg-brand-600 text-white px-8 py-3 text-lg rounded-xl hover:bg-brand-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    )
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          currency: formData.currency,
          status: 'pending',
        })
        .select()
        .single()

      if (listingError) throw listingError

      if (images.length > 0) {
        const imageUploads = images.map(async (file) => {
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}.${fileExt}`
          const filePath = `${user.id}/${listing.id}/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('listing_images')
            .upload(filePath, file)

          if (uploadError) throw uploadError

          const { error: imageRecordError } = await supabase
            .from('listing_images')
            .insert({
              listing_id: listing.id,
              image_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing_images/${filePath}`,
            })

          if (imageRecordError) throw imageRecordError
        })

        await Promise.all(imageUploads)
      }

      toast.success('Listing created successfully!')
      router.push(`/listings/${listing.id}`)
    } catch (error) {
      console.error('Error creating listing:', error)
      toast.error('Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Tell us about your item
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-medium mb-2 text-gray-700 dark:text-gray-200">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 dark:bg-gray-800"
                  placeholder="What are you selling?"
                />
              </div>

              <div>
                <label className="block text-lg font-medium mb-2 text-gray-700 dark:text-gray-200">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 dark:bg-gray-800"
                  placeholder="Describe your item in detail..."
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Set your price
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-medium mb-2 text-gray-700 dark:text-gray-200">
                  Price
                </label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 dark:bg-gray-800"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-lg font-medium mb-2 text-gray-700 dark:text-gray-200">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 dark:bg-gray-800"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Add some photos
            </h2>
            <ImageUpload
              images={images}
              setImages={setImages}
              maxImages={5}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {['Details', 'Price', 'Photos'].map((label, index) => (
                <div
                  key={label}
                  className={`text-lg font-medium ${
                    step > index ? 'text-brand-600' : 'text-gray-400'
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-brand-600 rounded-full transition-all duration-300"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />
            </div>
          </div>

          {/* Form content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
            <form onSubmit={(e) => e.preventDefault()}>
              {renderStep()}

              {/* Navigation buttons */}
              <div className="flex justify-between mt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center px-6 py-3 text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-brand-600 transition-colors"
                  >
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Back
                  </button>
                )}
                
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center ml-auto px-8 py-3 text-lg font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors"
                  >
                    Next
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center ml-auto px-8 py-3 text-lg font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Listing'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 
