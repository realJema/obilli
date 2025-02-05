'use client'

import Link from 'next/link'

interface BreadcrumbsProps {
  categoryId: number
  categoryName: string
}

export default function Breadcrumbs({ categoryId, categoryName }: BreadcrumbsProps) {
  return (
    <div className="text-sm text-gray-500 mb-4">
      <Link href="/" className="hover:text-blue-500">
        Home
      </Link>
      <span className="mx-2">›</span>
      <Link href={`/categories/${categoryId}`} className="hover:text-blue-500">
        {categoryName}
      </Link>
    </div>
  )
} 
