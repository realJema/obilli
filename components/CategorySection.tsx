'use client'

import React, { useState, useRef, useEffect } from 'react'

interface CategorySectionProps {
  category: string
  description?: string
  children: React.ReactNode
}

export default function CategorySection({ 
  category, 
  description,
  children 
}: CategorySectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftScroll, setShowLeftScroll] = useState(false)
  const [showRightScroll, setShowRightScroll] = useState(true)

  // Calculate item width based on container width
  const itemWidth = 'calc(20% - 16px)' // 20% for 5 items, minus gap

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return

    // Scroll exactly 5 items
    const scrollAmount = container.clientWidth
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    })
  }

  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    setShowLeftScroll(container.scrollLeft > 0)
    setShowRightScroll(
      container.scrollLeft < container.scrollWidth - container.clientWidth
    )
  }

  // Check scroll buttons visibility on mount and resize
  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      setShowRightScroll(container.scrollWidth > container.clientWidth)
    }

    const handleResize = () => {
      if (container) {
        setShowRightScroll(container.scrollWidth > container.clientWidth)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <section className="relative px-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{category}</h2>
        {description && (
          <p className="text-gray-600 mt-1">{description}</p>
        )}
      </div>

      <div className="relative group">
        {/* Left scroll button */}
        {showLeftScroll && (
          <button
            onClick={() => scroll('left')}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-lg rounded-r-lg p-2 hover:bg-white"
            aria-label="Scroll left"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Content container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto gap-4 scroll-smooth scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Wrap children with fixed-width containers */}
          {React.Children.map(children, (child) => (
            <div style={{ width: itemWidth, flexShrink: 0 }}>
              {child}
            </div>
          ))}
        </div>

        {/* Right scroll button */}
        {showRightScroll && (
          <button
            onClick={() => scroll('right')}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-lg rounded-l-lg p-2 hover:bg-white"
            aria-label="Scroll right"
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
