'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface FilterSidebarProps {
  currentCategoryId: number
  searchParams: { [key: string]: string | undefined }
  locations: {
    id: number
    name: string
  }[]
}

export default function FilterSidebar({ 
  currentCategoryId,
  searchParams,
  locations 
}: FilterSidebarProps) {
  const router = useRouter()
  const [priceRange, setPriceRange] = useState({
    min: searchParams.minPrice || '',
    max: searchParams.maxPrice || ''
  })
  const [selectedLocation, setSelectedLocation] = useState(searchParams.location || '')
  const [dateFilter, setDateFilter] = useState(searchParams.date || 'any')

  const handleFilter = () => {
    const params = new URLSearchParams()
    
    if (priceRange.min) params.set('minPrice', priceRange.min)
    if (priceRange.max) params.set('maxPrice', priceRange.max)
    if (selectedLocation) params.set('location', selectedLocation)
    if (dateFilter !== 'any') params.set('date', dateFilter)
    
    router.push(`/categories/${currentCategoryId}?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Price Range */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Price Range</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Min Price</label>
            <input
              type="number"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Min price"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Max Price</label>
            <input
              type="number"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Max price"
            />
          </div>
        </div>
      </div>

      {/* Location Filter */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Location</h3>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Locations</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date Filter */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Date Posted</h3>
        <div className="space-y-2">
          {[
            { value: 'any', label: 'Any time' },
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'This week' },
            { value: 'month', label: 'This month' },
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="dateFilter"
                value={option.value}
                checked={dateFilter === option.value}
                onChange={(e) => setDateFilter(e.target.value)}
                className="text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="ml-2 text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Apply Filters Button */}
      <button
        onClick={handleFilter}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Apply Filters
      </button>
    </div>
  )
} 
