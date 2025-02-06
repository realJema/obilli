'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import ImageUpload from '@/components/ImageUpload'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  CheckCircleIcon,
  PencilSquareIcon,
  TagIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  EyeIcon
} from '@heroicons/react/24/solid'
import { Category, Location } from '@/types'
import Image from 'next/image'
import { processImage } from '@/lib/image-helpers'

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[]
}

interface LocationWithChildren extends Location {
  children?: LocationWithChildren[]
}

interface FormState {
  title: string
  description: string
  price: string
  displayPrice: string
  currency: string
  category_id: string
  location_id: string
  selectedCategory: CategoryWithChildren | null
  selectedLocation: LocationWithChildren | null
}

const STEPS = [
  {
    id: 1,
    title: 'Basic Info',
    description: 'Start with the essentials',
    icon: PencilSquareIcon
  },
  {
    id: 2,
    title: 'Category & Location',
    description: 'Tell us where to find it',
    icon: MapPinIcon
  },
  {
    id: 3,
    title: 'Price',
    description: 'Set your price',
    icon: CurrencyDollarIcon
  },
  {
    id: 4,
    title: 'Photos',
    description: 'Show it off',
    icon: PhotoIcon
  },
  {
    id: 5,
    title: 'Preview',
    description: 'Review your listing',
    icon: EyeIcon
  }
]

const StepIndicator = ({ currentStep, steps }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="py-4">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex items-center flex-shrink-0">
                  <div 
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
                      ${currentStep === s.id 
                        ? 'bg-brand-600 text-white' 
                        : currentStep > s.id 
                          ? 'bg-brand-100 text-brand-600 dark:bg-brand-900 dark:text-brand-300' 
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-700'
                      }
                    `}
                  >
                    {currentStep > s.id ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                      s.id
                    )}
                  </div>
                  <span 
                    className={`
                      ml-3 font-medium whitespace-nowrap
                      ${currentStep === s.id 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-500 dark:text-gray-400'
                      }
                    `}
                  >
                    {s.title}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div className="mx-4 flex-1">
                    <div 
                      className={`
                        h-1 rounded-full
                        ${currentStep > s.id 
                          ? 'bg-brand-600' 
                          : 'bg-gray-200 dark:bg-gray-700'
                        }
                      `}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const LeftPanel = ({ currentStep, steps }) => {
  const step = steps[currentStep - 1]
  const StepIcon = step.icon

  return (
    <div className="w-1/3 p-12 flex flex-col min-h-[calc(100vh-73px)]">
      <div className="flex-1">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-brand-600 mb-4">
            {step.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {step.description}
          </p>
        </div>

        <div className="flex justify-center items-center">
          <StepIcon 
            className="w-48 h-48 text-brand-600/20" 
            aria-hidden="true" 
          />
        </div>
      </div>

      <div className="mt-auto pt-8 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-brand-600 font-medium mb-2">Tips</h3>
        <p className="text-gray-600 dark:text-gray-400">
          {currentStep === 1 && "Make your title clear and descriptive"}
          {currentStep === 2 && "Choose the most specific category for better visibility"}
          {currentStep === 3 && "Set a competitive price to attract potential buyers"}
          {currentStep === 4 && "Clear, well-lit photos help sell items faster"}
        </p>
      </div>
    </div>
  )
}

const ListingPreview = ({ formData, images }) => {
  return (
    <div className="space-y-8">
      <div className="aspect-video relative rounded-xl overflow-hidden bg-gray-100">
        {images.length > 0 ? (
          <Image
            src={URL.createObjectURL(images[0])}
            alt="Main listing image"
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <PhotoIcon className="w-24 h-24 text-gray-400" />
          </div>
        )}
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{formData.title}</h2>
        <p className="text-xl font-semibold text-brand-600">
          {formData.displayPrice} FCFA
        </p>
        <p className="whitespace-pre-wrap">{formData.description}</p>
        
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Category: {formData.selectedCategory?.name}</span>
          <span>Location: {formData.selectedLocation?.name}</span>
        </div>

        {images.length > 1 && (
          <div className="grid grid-cols-5 gap-4 mt-4">
            {images.slice(1).map((image, index) => (
              <div key={index} className="aspect-square relative rounded-lg overflow-hidden">
                <Image
                  src={URL.createObjectURL(image)}
                  alt={`Image ${index + 2}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PostAdPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [categoriesTree, setCategoriesTree] = useState<CategoryWithChildren[]>([])
  const [locationsTree, setLocationsTree] = useState<LocationWithChildren[]>([])
  const [selectedSubcategory, setSelectedSubcategory] = useState<CategoryWithChildren | null>(null)
  const [selectedSubLocation, setSelectedSubLocation] = useState<LocationWithChildren | null>(null)
  const [formState, setFormState] = useState<FormState>({
    title: '',
    description: '',
    price: '',
    displayPrice: '',
    currency: 'FCFA',
    category_id: '',
    location_id: '',
    selectedCategory: null,
    selectedLocation: null,
  })
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    async function fetchData() {
      try {
        const [{ data: categoriesData }, { data: locationsData }] = await Promise.all([
          supabase.from('categories').select('*').order('name'),
          supabase.from('locations').select('*').order('name')
        ])

        if (categoriesData && locationsData) {
          // Build category tree
          const categoryTree = buildTree(categoriesData)
          setCategoriesTree(categoryTree)

          // Build location tree
          const locationTree = buildTree(locationsData)
          setLocationsTree(locationTree)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load categories and locations')
      }
    }

    fetchData()
  }, [])

  // Helper function to build tree structure
  const buildTree = (items: any[]) => {
    const itemMap = {}
    const roots = []

    // First pass: create nodes
    items.forEach(item => {
      itemMap[item.id] = { ...item, children: [] }
    })

    // Second pass: create relationships
    items.forEach(item => {
      if (item.parent_id && itemMap[item.parent_id]) {
        itemMap[item.parent_id].children.push(itemMap[item.id])
      } else {
        roots.push(itemMap[item.id])
      }
    })

    return roots
  }

  const handleCategorySelect = (category: CategoryWithChildren) => {
    setSelectedSubcategory(null)
    setFormState(prev => ({
      ...prev,
      selectedCategory: category,
      category_id: category.children?.length ? '' : String(category.id)
    }))
  }

  const handleSubcategorySelect = (subcategory: CategoryWithChildren) => {
    setSelectedSubcategory(subcategory)
    setFormState(prev => ({
      ...prev,
      category_id: String(subcategory.id)
    }))
  }

  const handleLocationSelect = (location: LocationWithChildren) => {
    setSelectedSubLocation(null)
    setFormState(prev => ({
      ...prev,
      selectedLocation: location,
      location_id: location.children?.length ? '' : String(location.id)
    }))
  }

  const handleSubLocationSelect = (sublocation: LocationWithChildren) => {
    setSelectedSubLocation(sublocation)
    setFormState(prev => ({
      ...prev,
      location_id: String(sublocation.id)
    }))
  }

  const updateFormState = (field: keyof FormState, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      // Validate form data first
      if (!formState.title.trim()) {
        throw new Error('Title is required')
      }
      if (!formState.description.trim()) {
        throw new Error('Description is required')
      }
      if (!formState.category_id) {
        throw new Error('Please select a category')
      }
      if (!formState.location_id) {
        throw new Error('Please select a location')
      }
      if (!formState.price || parseInt(formState.price) <= 0) {
        throw new Error('Please enter a valid price')
      }

      // Check if user exists in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (userError) {
        toast.error('Please complete your profile setup before creating a listing')
        router.push('/profile/setup') // Redirect to profile setup if needed
        return
      }

      // Create the listing with the user's ID from users table
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          user_id: userData.id,
          title: formState.title,
          description: formState.description,
          price: parseInt(formState.price),
          currency: formState.currency,
          category_id: parseInt(formState.category_id),
          location_id: parseInt(formState.location_id),
          status: 'pending',
        })
        .select(`
          *,
          categories (
            name
          ),
          locations (
            name
          ),
          users (
            id,
            name,
            email,
            profile_picture,
            role,
            phone
          )
        `)
        .single()

      if (listingError) {
        console.error('Error creating listing:', listingError)
        throw listingError
      }

      // Upload images if any
      if (images.length > 0) {
        try {
          setUploadProgress(10)

          // Process images sequentially to avoid memory issues
          const processedImages = []
          for (const file of images) {
            const processed = await processImage(file)
            processedImages.push(processed)
            setUploadProgress(prev => prev + (30 / images.length))
          }

          // Upload processed images
          let completedUploads = 0
          const imageUploads = processedImages.map(async (file, index) => {
            try {
              const fileName = `${Date.now()}-${index}.jpg`
              const filePath = `${user.id}/${listing.id}/${fileName}`

              const { error: uploadError } = await supabase.storage
                .from('listing_images')
                .upload(filePath, file, {
                  cacheControl: '3600',
                  upsert: false
                })

              if (uploadError) throw uploadError

              completedUploads++
              setUploadProgress(40 + Math.round((completedUploads / images.length) * 60))

              const { data: { publicUrl } } = supabase.storage
                .from('listing_images')
                .getPublicUrl(filePath)

              return supabase
                .from('listing_images')
                .insert({
                  listing_id: listing.id,
                  image_url: publicUrl,
                })
            } catch (error) {
              console.error('Error uploading image:', error)
              throw error
            }
          })

          await Promise.all(imageUploads)
          setUploadProgress(100)
        } catch (error) {
          console.error('Error processing images:', error)
          throw error
        }
      }

      toast.success('Listing created successfully!')
      router.push(`/post-ad/success?id=${listing.id}`)
    } catch (error) {
      console.error('Error creating listing:', error)
      toast.error(error.message || 'Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  const renderCategoryLocationSection = () => (
    <div className="space-y-8">
      {/* Categories */}
        <div>
        <label className="block text-lg font-medium mb-4 text-gray-700 dark:text-gray-200">
            Category
          </label>
        <div className="space-y-4">
          {/* Main categories */}
          <div className="flex flex-wrap gap-2">
            {categoriesTree.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${formState.selectedCategory?.id === category.id
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                type="button"
              >
                {category.name}
                {category.children?.length > 0 && ' ›'}
              </button>
            ))}
          </div>

          {/* Subcategories */}
          {formState.selectedCategory?.children?.length > 0 && (
            <div className="ml-4 flex flex-wrap gap-2">
              {formState.selectedCategory.children.map(subcategory => (
                <button
                  key={subcategory.id}
                  onClick={() => handleSubcategorySelect(subcategory)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${selectedSubcategory?.id === subcategory.id
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  type="button"
                >
                  {subcategory.name}
                  {selectedSubcategory?.id === subcategory.id && (
                    <CheckCircleIcon className="w-4 h-4 ml-1 inline-block" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        </div>

      {/* Locations */}
        <div>
        <label className="block text-lg font-medium mb-4 text-gray-700 dark:text-gray-200">
            Location
          </label>
        <div className="space-y-4">
          {/* Main locations */}
          <div className="flex flex-wrap gap-2">
            {locationsTree.map(location => (
              <button
                key={location.id}
                onClick={() => handleLocationSelect(location)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${formState.selectedLocation?.id === location.id
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                type="button"
              >
                {location.name}
                {location.children?.length > 0 && ' ›'}
              </button>
            ))}
          </div>

          {/* Sublocations */}
          {formState.selectedLocation?.children?.length > 0 && (
            <div className="ml-4 flex flex-wrap gap-2">
              {formState.selectedLocation.children.map(sublocation => (
                <button
                  key={sublocation.id}
                  onClick={() => handleSubLocationSelect(sublocation)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${selectedSubLocation?.id === sublocation.id
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  type="button"
                >
                  {sublocation.name}
                  {selectedSubLocation?.id === sublocation.id && (
                    <CheckCircleIcon className="w-4 h-4 ml-1 inline-block" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8">
            <div>
              <label htmlFor="title" className="block text-lg font-medium mb-2 text-gray-700 dark:text-gray-200">
                Title
              </label>
              <input
                id="title"
                defaultValue={formState.title}
                onBlur={(e) => updateFormState('title', e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 dark:bg-gray-800"
                placeholder="What are you selling?"
                required
              />
        </div>

        <div>
              <label htmlFor="description" className="block text-lg font-medium mb-2 text-gray-700 dark:text-gray-200">
                Description
              </label>
              <textarea
                id="description"
                defaultValue={formState.description}
                onBlur={(e) => updateFormState('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 dark:bg-gray-800"
                placeholder="Describe your item in detail"
                required
              />
            </div>
          </div>
        )

      case 2:
        return renderCategoryLocationSection()

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="price" className="block text-lg font-medium mb-2 text-gray-700 dark:text-gray-200">
                Price (FCFA)
              </label>
              <input
                id="price"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                defaultValue={formState.displayPrice}
                onBlur={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '')
                  const numericValue = value === '' ? '' : value
                  const displayValue = numericValue ? parseInt(numericValue).toLocaleString('fr-FR') : ''
                  
                  setFormState(prev => ({
                    ...prev,
                    price: numericValue,
                    displayPrice: displayValue
                  }))
                }}
                className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 dark:bg-gray-800"
                placeholder="0"
                required
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <ImageUpload
              images={images}
              setImages={setImages}
              maxImages={5}
            />
          </div>
        )

      case 5:
        return (
          <ListingPreview formData={formState} images={images} />
        )

      default:
        return null
    }
  }

  const MainContent = () => {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <StepIndicator currentStep={step} steps={STEPS} />
        
        <div className="flex">
          <LeftPanel currentStep={step} steps={STEPS} />

          <div className="w-2/3 p-12">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
                <form onSubmit={(e) => e.preventDefault()} className="min-h-[400px] flex flex-col">
                  <div className="flex-1">
                    {renderStep()}
                  </div>

                  {/* Fixed position navigation buttons */}
                  <div className="sticky bottom-0 left-0 right-0 flex justify-between mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={() => setStep(step - 1)}
                        className="flex items-center px-6 py-3 text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-brand-600 transition-colors"
                      >
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        Back
                      </button>
                    )}
                    
                    {step < STEPS.length ? (
                      <button
                        type="button"
                        onClick={() => setStep(step + 1)}
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
                        {loading ? (
                          <div className="flex items-center">
                            <span className="mr-2">Creating...</span>
                            {uploadProgress > 0 && (
                              <span className="text-sm">({uploadProgress}%)</span>
                            )}
                          </div>
                        ) : (
                          'Create Listing'
                        )}
          </button>
                    )}
        </div>
      </form>
    </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Please Sign In
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
          You need to be signed in to post a listing
        </p>
        <button
          onClick={() => router.push('/auth')}
          className="bg-brand-600 text-white px-8 py-3 text-lg rounded-xl hover:bg-brand-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    )
  }

  return <MainContent />
}
