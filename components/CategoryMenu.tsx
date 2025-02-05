'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

interface Category {
  id: number
  name: string
  parent_id: number | null
  description?: string
}

interface CategoryMenuProps {
  categories: Category[]
}

export default function CategoryMenu({ categories }: CategoryMenuProps) {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftCaret, setShowLeftCaret] = useState(false)
  const [showRightCaret, setShowRightCaret] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const categoryRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})

  // Get main categories (no parent)
  const mainCategories = categories.filter(cat => !cat.parent_id)

  // Get subcategories for a parent
  const getSubcategories = (parentId: number) => {
    return categories.filter(cat => cat.parent_id === parentId)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200
      const container = scrollContainerRef.current
      const newScrollLeft = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount

      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })

      // Update caret visibility after scroll
      setTimeout(() => {
        if (container) {
          setShowLeftCaret(container.scrollLeft > 0)
          setShowRightCaret(
            container.scrollLeft < container.scrollWidth - container.clientWidth
          )
        }
      }, 300)
    }
  }

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      setShowLeftCaret(container.scrollLeft > 0)
      setShowRightCaret(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      )
    }
  }

  const calculateDropdownPosition = (categoryId: number) => {
    const categoryElement = categoryRefs.current[categoryId]
    if (!categoryElement || !dropdownRef.current) return {}

    const categoryRect = categoryElement.getBoundingClientRect()
    const containerWidth = 672 // 42rem = 672px
    const viewportWidth = window.innerWidth
    const isLastThird = categoryRect.right > (viewportWidth * 2/3)

    let style = {
      position: 'fixed',
      top: `${categoryRect.bottom + 8}px`,
      width: '42rem',
    } as const

    if (isLastThird) {
      // For elements in the last third, align right edge of dropdown with right edge of category
      return {
        ...style,
        right: `${viewportWidth - categoryRect.right}px`,
        left: 'auto'
      }
    } else {
      // For other elements, center align
      const containerLeft = Math.max(
        Math.min(
          categoryRect.left - (containerWidth / 2) + (categoryRect.width / 2),
          viewportWidth - containerWidth - 32
        ),
        16
      )
      return {
        ...style,
        left: `${containerLeft}px`
      }
    }
  }

  return (
    <div className="relative flex items-center">
      {/* Left Scroll Button */}
      {showLeftCaret && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 z-20 h-full px-2 bg-gradient-to-r from-white via-white to-transparent"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Categories Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto scrollbar-hide space-x-6 py-2 px-4 relative w-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {mainCategories.map(category => {
          const subcategories = getSubcategories(category.id)
          
          return (
            <div
              key={category.id}
              ref={el => categoryRefs.current[category.id] = el}
              className="relative flex-shrink-0"
              onMouseEnter={() => setOpenDropdown(category.id)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href={`/categories/${category.id}`}
                className="px-3 py-2 text-gray-700 hover:text-blue-600 rounded-md inline-flex items-center whitespace-nowrap group"
              >
                {category.name}
                {subcategories.length > 0 && (
                  <svg
                    className="w-4 h-4 ml-1 group-hover:text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
              </Link>

              {/* Mega Menu Dropdown */}
              {openDropdown === category.id && subcategories.length > 0 && (
                <div 
                  ref={dropdownRef}
                  className="fixed bg-white shadow-xl ring-1 ring-black ring-opacity-5 rounded-lg z-50"
                  style={calculateDropdownPosition(category.id)}
                >
                  <div className="p-8">
                    <div className="grid grid-cols-3 gap-8">
                      {subcategories.map(subcat => {
                        const thirdLevel = getSubcategories(subcat.id)
                        return (
                          <div key={subcat.id} className="relative">
                            <Link
                              href={`/categories/${subcat.id}`}
                              className="text-lg font-semibold text-gray-900 hover:text-blue-600 block mb-3"
                            >
                              {subcat.name}
                            </Link>
                            {thirdLevel.length > 0 && (
                              <ul className="mt-3 space-y-3">
                                {thirdLevel.map(thirdCat => (
                                  <li key={thirdCat.id}>
                                    <Link
                                      href={`/categories/${thirdCat.id}`}
                                      className="text-base text-gray-600 hover:text-blue-600 block"
                                    >
                                      {thirdCat.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Right Scroll Button */}
      {showRightCaret && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 z-20 h-full px-2 bg-gradient-to-l from-white via-white to-transparent"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  )
} 
