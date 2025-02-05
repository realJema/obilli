'use client'

import { useState, useRef } from 'react'
import ListingCard from './ListingCard'
import { Listing } from '@/types'

interface CategorySectionProps {
  category: string
  description?: string
  listings: Listing[]
}

export default function CategorySection({ category, description, listings }: CategorySectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftScroll, setShowLeftScroll] = useState(false)
  const [showRightScroll, setShowRightScroll] = useState(true)

  // Take only the first 10 listings
  const displayListings = listings.slice(0, 10)

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = container.clientWidth * 0.8 // Scroll 80% of container width
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    })

    // Update scroll button visibility after animation
    setTimeout(() => {
      if (container) {
        setShowLeftScroll(container.scrollLeft > 0)
        setShowRightScroll(
          container.scrollLeft < container.scrollWidth - container.clientWidth - 10
        )
      }
    }, 300)
  }

  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    setShowLeftScroll(container.scrollLeft > 0)
    setShowRightScroll(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    )
  }

  return (
    <section className="relative px-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{category}</h2>
        {description && (
          <p className="text-gray-500 mt-1">{description}</p>
        )}
      </div>

      <div className="relative group">
        {/* Left scroll button */}
        {showLeftScroll && (
          <button
            onClick={() => scroll('left')}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-lg rounded-r-lg p-2 hover:bg-white"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Listings container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto gap-6 scroll-smooth scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayListings.map((listing) => (
            <div key={listing.id} className="flex-none w-[280px]">
              <ListingCard ad={listing} />
            </div>
          ))}
        </div>

        {/* Right scroll button */}
        {showRightScroll && (
          <button
            onClick={() => scroll('right')}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-lg rounded-l-lg p-2 hover:bg-white"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </section>
  )
} 
