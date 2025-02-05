'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface SortSelectProps {
  totalCount: number
}

export default function SortSelect({ totalCount }: SortSelectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
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
        className="border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchParams.get('sort') || 'newest'}
        onChange={(e) => handleSort(e.target.value)}
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="price_low">Price: Low to High</option>
        <option value="price_high">Price: High to Low</option>
      </select>
    </div>
  )
} 
