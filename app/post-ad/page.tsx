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
  EyeIcon,
  PhoneIcon
} from '@heroicons/react/24/solid'
import { Category, Location } from '@/types'
import Image from 'next/image'
import { processImage } from '@/lib/image-helpers'
import { BsWhatsapp } from 'react-icons/bs'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import Link from 'next/link'
import { XMarkIcon } from '@heroicons/react/24/outline'

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
  use_profile_number: boolean
  contact_number: string
  contact_whatsapp: boolean
  contact_call: boolean
}

interface ContactOptionsSectionProps {
  formState: FormState
  setFormState: (state: FormState | ((prev: FormState) => FormState)) => void
  user: any
}

const STEPS = [
  {
    id: 1,
    title: 'Listing Details',
    description: 'Add basic information',
    icon: PencilSquareIcon
  },
  {
    id: 2,
    title: 'Category',
    description: 'Choose category',
    icon: TagIcon
  },
  {
    id: 3,
    title: 'Location & Contact',
    description: 'Add contact details',
    icon: MapPinIcon
  },
  {
    id: 4,
    title: 'Photos',
    description: 'Upload images',
    icon: PhotoIcon
  },
  {
    id: 5,
    title: 'Review & Publish',
    description: 'Preview and submit',
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

const CategorySelector = ({ 
  categories, 
  formState, 
  setFormState, 
  selectedSubcategory, 
  setSelectedSubcategory 
}) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-6"
  >
    <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
      <TagIcon className="w-6 h-6 text-brand-600" />
      Choose Category
    </h3>

    <div className="grid md:grid-cols-2 gap-6">
      {/* Main Categories */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Main Category
          </label>
        <div className="bg-gray-50 rounded-xl p-3 h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
          {categories.map(category => (
            <motion.button
              key={category.id}
              onClick={() => {
                setFormState(prev => ({
                  ...prev,
                  selectedCategory: category,
                  category_id: category.children?.length ? '' : String(category.id)
                }))
                setSelectedSubcategory(null)
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={clsx(
                "w-full text-left p-3 rounded-lg transition-all",
                "flex items-center justify-between",
                formState.selectedCategory?.id === category.id
                  ? "bg-brand-50 text-brand-600 border-brand-200"
                  : "hover:bg-white hover:shadow-sm"
              )}
            >
              <span>{category.name}</span>
              {category.children?.length > 0 && (
                <ArrowRightIcon className="w-4 h-4" />
              )}
            </motion.button>
          ))}
        </div>
        </div>

      {/* Subcategories */}
      {formState.selectedCategory?.children?.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-3"
        >
          <label className="block text-sm font-medium text-gray-700">
            Subcategory
          </label>
          <div className="bg-gray-50 rounded-xl p-3 h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
            {formState.selectedCategory.children.map(subcategory => (
              <motion.button
                key={subcategory.id}
                onClick={() => {
                  setSelectedSubcategory(subcategory)
                  setFormState(prev => ({
                    ...prev,
                    category_id: String(subcategory.id)
                  }))
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={clsx(
                  "w-full text-left p-3 rounded-lg transition-all",
                  selectedSubcategory?.id === subcategory.id
                    ? "bg-brand-50 text-brand-600 border-brand-200"
                    : "hover:bg-white hover:shadow-sm"
                )}
              >
                {subcategory.name}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  </motion.div>
)

const LocationSelector = ({ 
  locations, 
  formState, 
  setFormState, 
  selectedSubLocation, 
  setSelectedSubLocation 
}) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-6 mt-12"
  >
    <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
      <MapPinIcon className="w-6 h-6 text-brand-600" />
      Select Location
    </h3>

    <div className="grid md:grid-cols-2 gap-6">
      {/* Main Locations */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Region
        </label>
        <div className="bg-gray-50 rounded-xl p-3 h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
          {locations.map(location => (
            <motion.button
              key={location.id}
              onClick={() => {
                setFormState(prev => ({
                  ...prev,
                  selectedLocation: location,
                  location_id: location.children?.length ? '' : String(location.id)
                }))
                setSelectedSubLocation(null)
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={clsx(
                "w-full text-left p-3 rounded-lg transition-all",
                "flex items-center justify-between",
                formState.selectedLocation?.id === location.id
                  ? "bg-brand-50 text-brand-600 border-brand-200"
                  : "hover:bg-white hover:shadow-sm"
              )}
            >
              <span>{location.name}</span>
              {location.children?.length > 0 && (
                <ArrowRightIcon className="w-4 h-4" />
              )}
            </motion.button>
          ))}
        </div>
        </div>

      {/* Sub-locations */}
      {formState.selectedLocation?.children?.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-3"
        >
          <label className="block text-sm font-medium text-gray-700">
            City
          </label>
          <div className="bg-gray-50 rounded-xl p-3 h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
            {formState.selectedLocation.children.map(sublocation => (
              <motion.button
                key={sublocation.id}
                onClick={() => {
                  setSelectedSubLocation(sublocation)
                  setFormState(prev => ({
                    ...prev,
                    location_id: String(sublocation.id)
                  }))
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={clsx(
                  "w-full text-left p-3 rounded-lg transition-all",
                  selectedSubLocation?.id === sublocation.id
                    ? "bg-brand-50 text-brand-600 border-brand-200"
                    : "hover:bg-white hover:shadow-sm"
                )}
              >
                {sublocation.name}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  </motion.div>
)

const ContactOptionsSection = ({ formState, setFormState, user }: ContactOptionsSectionProps) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-6"
  >
    <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
      <PhoneIcon className="w-6 h-6 text-brand-600" />
      Contact Options
    </h3>

    <div className="space-y-8">
      {/* Phone Number Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Contact Phone Number
        </label>
        <div className="space-y-4">
          <motion.label 
            whileHover={{ scale: 1.01 }}
            className="flex items-center p-4 rounded-xl bg-gray-50 cursor-pointer"
          >
            <input
              type="radio"
              checked={formState.use_profile_number}
              onChange={() => setFormState(prev => ({
                ...prev,
                use_profile_number: true,
                contact_number: user?.user_metadata.phone || ''
              }))}
              className="text-brand-600 focus:ring-brand-500"
            />
            <span className="ml-3">Use my profile number ({user?.user_metadata.phone || 'Not set'})</span>
          </motion.label>
          
          <motion.label 
            whileHover={{ scale: 1.01 }}
            className="flex items-center p-4 rounded-xl bg-gray-50 cursor-pointer"
          >
            <input
              type="radio"
              checked={!formState.use_profile_number}
              onChange={() => setFormState(prev => ({
                ...prev,
                use_profile_number: false
              }))}
              className="text-brand-600 focus:ring-brand-500"
            />
            <span className="ml-3">Use a different number</span>
          </motion.label>

          {!formState.use_profile_number && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <input
                type="tel"
                value={formState.contact_number}
                onChange={(e) => setFormState(prev => ({
                  ...prev,
                  contact_number: e.target.value
                }))}
                placeholder="Enter phone number"
                className="w-full px-4 py-3 rounded-xl border-gray-200 focus:ring-2 focus:ring-brand-500"
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Contact Methods */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          How would you like to be contacted?
        </label>
        <div className="grid grid-cols-2 gap-4">
          <motion.label 
            whileHover={{ scale: 1.01 }}
            className={clsx(
              "flex items-center p-4 rounded-xl cursor-pointer transition-colors",
              formState.contact_whatsapp ? "bg-green-50" : "bg-gray-50"
            )}
          >
            <input
              type="checkbox"
              checked={formState.contact_whatsapp}
              onChange={(e) => setFormState(prev => ({
                ...prev,
                contact_whatsapp: e.target.checked
              }))}
              className="text-green-500 focus:ring-green-400 rounded"
            />
            <span className="ml-3 flex items-center gap-2">
              <BsWhatsapp className="w-5 h-5 text-green-500" />
              WhatsApp
            </span>
          </motion.label>
          
          <motion.label 
            whileHover={{ scale: 1.01 }}
            className={clsx(
              "flex items-center p-4 rounded-xl cursor-pointer transition-colors",
              formState.contact_call ? "bg-brand-50" : "bg-gray-50"
            )}
          >
            <input
              type="checkbox"
              checked={formState.contact_call}
              onChange={(e) => setFormState(prev => ({
                ...prev,
                contact_call: e.target.checked
              }))}
              className="text-brand-600 focus:ring-brand-500 rounded"
            />
            <span className="ml-3 flex items-center gap-2">
              <PhoneIcon className="w-5 h-5" />
              Phone Call
            </span>
          </motion.label>
        </div>
      </div>

      {!formState.contact_whatsapp && !formState.contact_call && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 text-sm"
        >
          Please select at least one contact method
        </motion.p>
      )}
    </div>
  </motion.div>
)

const validateContactOptions = (formState) => {
  if (!formState.contact_whatsapp && !formState.contact_call) {
    toast.error('Please select at least one contact method')
    return false
  }

  if (!formState.use_profile_number && !formState.contact_number) {
    toast.error('Please enter a contact number')
    return false
  }

  return true
}

// Update the Logo component
const Logo = () => (
  <span className="text-4xl font-extrabold text-brand-600">
    Obilli
  </span>
)

// Add this new component for the listing details form
const ListingDetailsForm = ({ formState, setFormState }) => {
  // Local state for input values
  const [title, setTitle] = useState(formState.title)
  const [description, setDescription] = useState(formState.description)
  const [price, setPrice] = useState(formState.displayPrice)

  // Update parent state on blur
  const handleBlur = () => {
    setFormState(prev => ({
      ...prev,
      title,
      description,
      price: price.replace(/[^\d]/g, ''),
      displayPrice: price
    }))
  }

  // Format price as user types
  const handlePriceChange = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, '')
    const displayValue = numericValue ? parseInt(numericValue).toLocaleString('fr-FR') : ''
    setPrice(displayValue)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-6">Add Listing Details</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleBlur}
              className="w-full px-4 py-3 text-lg border rounded-xl focus:ring-2 focus:ring-brand-500"
              placeholder="Short and descriptive title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleBlur}
              rows={6}
              className="w-full px-4 py-3 text-lg border rounded-xl focus:ring-2 focus:ring-brand-500"
              placeholder="Include detailed features, specifications, condition, and any additional information"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Price (FCFA)</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={price}
              onChange={(e) => handlePriceChange(e.target.value)}
              onBlur={handleBlur}
              className="w-full px-4 py-3 text-lg border rounded-xl focus:ring-2 focus:ring-brand-500"
              placeholder="Enter price"
            />
          </div>
        </div>
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
    use_profile_number: true,
    contact_number: '',
    contact_whatsapp: true,
    contact_call: true
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
      } else if (!item.parent_id) { // Only add to roots if no parent_id
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

      if (!validateContactOptions(formState)) return

      // Create the listing with the user's ID from users table
      const listingData = {
        user_id: userData.id,
        title: formState.title,
        description: formState.description,
        price: parseInt(formState.price),
        currency: formState.currency,
        category_id: parseInt(formState.category_id),
        location_id: parseInt(formState.location_id),
        status: 'pending',
        contact_number: formState.use_profile_number ? 
          user?.user_metadata.phone : 
          formState.contact_number,
        contact_whatsapp: formState.contact_whatsapp,
        contact_call: formState.contact_call,
        use_profile_number: formState.use_profile_number
      }

      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert(listingData)
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

  const validateStep = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        if (!formState.title.trim()) {
          toast.error('Please enter a title')
          return false
        }
        if (!formState.description.trim()) {
          toast.error('Please enter a description')
          return false
        }
        if (!validateContactOptions(formState)) {
          return false
        }
        return true

      case 2:
        if (!formState.category_id) {
          toast.error('Please select a category')
          return false
        }
        if (!formState.location_id) {
          toast.error('Please select a location')
          return false
        }
        return true

      case 3:
        if (!formState.use_profile_number && !formState.contact_number) {
          toast.error('Please enter a contact number')
          return false
        }
        return true

      case 4:
        if (images.length === 0) {
          toast.error('Please upload at least one photo')
          return false
        }
        return true

      case 5:
        return true

      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <ListingDetailsForm formState={formState} setFormState={setFormState} />

      case 2:
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold mb-6">Select Category</h2>
            <div className="space-y-8">
              {/* Main Categories */}
              <div>
                <label className="block text-sm font-medium mb-4">Main Category</label>
                <div className="flex flex-wrap gap-3">
                  {categoriesTree.map(category => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setFormState(prev => ({
                          ...prev,
                          selectedCategory: category,
                          category_id: category.children?.length ? '' : String(category.id)
                        }))
                        setSelectedSubcategory(null)
                      }}
                      className={clsx(
                        "px-6 py-3 rounded-full text-sm font-medium transition-all",
                        formState.selectedCategory?.id === category.id
                          ? "bg-brand-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategories */}
              {formState.selectedCategory?.children?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <label className="block text-sm font-medium mb-4">Subcategory</label>
                  <div className="flex flex-wrap gap-3">
                    {formState.selectedCategory.children.map(subcategory => (
                      <button
                        key={subcategory.id}
                        onClick={() => {
                          setSelectedSubcategory(subcategory)
                          setFormState(prev => ({
                            ...prev,
                            category_id: String(subcategory.id)
                          }))
                        }}
                        className={clsx(
                          "px-6 py-3 rounded-full text-sm font-medium transition-all border-2",
                          selectedSubcategory?.id === subcategory.id
                            ? "border-brand-600 bg-brand-50 text-brand-600"
                            : "border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                      >
                        {subcategory.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold mb-6">Location & Contact Details</h2>
            
            {/* Location Selection */}
            <div className="space-y-8">
        <div>
                <label className="block text-sm font-medium mb-4">Select Location</label>
                <div className="flex flex-wrap gap-3">
                  {locationsTree.map(location => (
                    <button
                      key={location.id}
                      onClick={() => {
                        setFormState(prev => ({
                          ...prev,
                          selectedLocation: location,
                          location_id: location.children?.length ? '' : String(location.id)
                        }))
                        setSelectedSubLocation(null)
                      }}
                      className={clsx(
                        "px-6 py-3 rounded-full text-sm font-medium transition-all",
                        formState.selectedLocation?.id === location.id
                          ? "bg-brand-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {location.name}
                    </button>
                  ))}
                </div>
              </div>

              {formState.selectedLocation?.children?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <label className="block text-sm font-medium mb-4">Select City</label>
                  <div className="flex flex-wrap gap-3">
                    {formState.selectedLocation.children.map(city => (
                      <button
                        key={city.id}
                        onClick={() => {
                          setSelectedSubLocation(city)
                          setFormState(prev => ({
                            ...prev,
                            location_id: String(city.id)
                          }))
                        }}
                        className={clsx(
                          "px-6 py-3 rounded-full text-sm font-medium transition-all border-2",
                          selectedSubLocation?.id === city.id
                            ? "border-brand-600 bg-brand-50 text-brand-600"
                            : "border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Contact Options */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Contact Methods</h3>
              
              {/* Phone Number */}
              <div className="space-y-4">
                <label className="block text-sm font-medium">Phone Number</label>
                <div className="space-y-3">
                  <label className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <input
                      type="radio"
                      checked={formState.use_profile_number}
                      onChange={() => setFormState(prev => ({
                        ...prev,
                        use_profile_number: true,
                        contact_number: user?.user_metadata.phone || ''
                      }))}
                      className="text-brand-600"
                    />
                    <span className="ml-3">Use my profile number ({user?.user_metadata.phone || 'Not set'})</span>
                  </label>

                  <label className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <input
                      type="radio"
                      checked={!formState.use_profile_number}
                      onChange={() => setFormState(prev => ({
                        ...prev,
                        use_profile_number: false
                      }))}
                      className="text-brand-600"
                    />
                    <span className="ml-3">Use a different number</span>
                  </label>

                  {!formState.use_profile_number && (
                    <input
                      type="tel"
                      value={formState.contact_number}
                      onChange={(e) => setFormState(prev => ({
                        ...prev,
                        contact_number: e.target.value
                      }))}
                      placeholder="Enter phone number"
                      className="w-full px-4 py-3 border rounded-xl"
                    />
                  )}
                </div>
              </div>

              {/* Contact Methods */}
              <div className="space-y-4">
                <label className="block text-sm font-medium">Preferred Contact Methods</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={clsx(
                    "flex items-center p-4 rounded-xl cursor-pointer transition-colors",
                    formState.contact_whatsapp ? "bg-green-50" : "bg-gray-50"
                  )}>
                    <input
                      type="checkbox"
                      checked={formState.contact_whatsapp}
                      onChange={(e) => setFormState(prev => ({
                        ...prev,
                        contact_whatsapp: e.target.checked
                      }))}
                      className="text-green-500"
                    />
                    <span className="ml-3 flex items-center gap-2">
                      <BsWhatsapp className="w-5 h-5 text-green-500" />
                      WhatsApp
                    </span>
                  </label>

                  <label className={clsx(
                    "flex items-center p-4 rounded-xl cursor-pointer transition-colors",
                    formState.contact_call ? "bg-brand-50" : "bg-gray-50"
                  )}>
                    <input
                      type="checkbox"
                      checked={formState.contact_call}
                      onChange={(e) => setFormState(prev => ({
                        ...prev,
                        contact_call: e.target.checked
                      }))}
                      className="text-brand-600"
                    />
                    <span className="ml-3 flex items-center gap-2">
                      <PhoneIcon className="w-5 h-5" />
                      Phone Call
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold mb-6">Upload Photos</h2>
            <ImageUpload
              images={images}
              setImages={setImages}
              maxImages={5}
            />
          </div>
        )

      case 5:
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold mb-6">Review & Publish</h2>
            <ListingPreview formData={formState} images={images} />
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={clsx(
                  "px-8 py-3 bg-brand-600 text-white rounded-xl font-medium",
                  "hover:bg-brand-700 transition-colors",
                  loading && "opacity-50 cursor-not-allowed"
                )}
              >
                {loading ? 'Publishing...' : 'Publish Listing'}
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const MainContent = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-white">
          <div className="container mx-auto px-4 flex items-center space-x-12">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Logo />
            </Link>

            {/* Steps - using flex-grow to take remaining space */}
            <div className="flex-grow">
              <StepIndicator currentStep={step} steps={STEPS} />
            </div>

            {/* Close button */}
            <Link 
              href="/"
              className="flex-shrink-0 p-2.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-7 h-7 text-gray-600" />
            </Link>
          </div>
        </div>

        <div className="flex">
          <LeftPanel currentStep={step} steps={STEPS} />

          <div className="w-2/3 p-12">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
                <form onSubmit={(e) => e.preventDefault()} className="min-h-[400px] flex flex-col">
                  <div className="flex-1">
                    {renderStepContent()}
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
