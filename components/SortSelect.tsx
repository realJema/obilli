'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface SortSelectProps {
  totalCount: number
}

export default function SortSelect({ totalCount }: SortSelectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSort = (value: string) => {
    // Create new URLSearchParams with current or empty params
    const params = new URLSearchParams(searchParams?.toString() || '')
    
    params.set('sort', value)
    // Reset to first page when sorting changes
    params.set('page', '1')
    
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-gray-600">
        {totalCount} {totalCount === 1 ? 'listing' : 'listings'} found
      </p>
      <select
        value={searchParams?.get('sort') || 'newest'}
        onChange={(e) => handleSort(e.target.value)}
        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  )
} 
