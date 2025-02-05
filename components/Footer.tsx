'use client'

import Link from 'next/link'

interface Category {
  id: number
  name: string
  parent_id: number | null
  description?: string
}

interface FooterProps {
  categories: Category[]
}

export default function Footer({ categories }: FooterProps) {
  // Get main categories and their subcategories
  const getCategoryTree = () => {
    const mainCategories = categories.filter(cat => !cat.parent_id)
    
    return mainCategories.map(main => ({
      ...main,
      subcategories: categories
        .filter(cat => cat.parent_id === main.id)
        .map(sub => ({
          ...sub,
          children: categories.filter(cat => cat.parent_id === sub.id)
        }))
    }))
  }

  const categoryTree = getCategoryTree()

  return (
    <footer className="bg-gray-100 border-t">
      <div className="container mx-auto px-4 py-12">
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categoryTree.map(mainCat => (
            <div key={mainCat.id}>
              <h3 className="font-bold text-lg text-gray-900 mb-4">
                {mainCat.name}
              </h3>
              <div className="space-y-6">
                {mainCat.subcategories.map(subCat => (
                  <div key={subCat.id}>
                    <Link
                      href={`/categories/${subCat.id}`}
                      className="font-medium text-gray-700 hover:text-blue-600"
                    >
                      {subCat.name}
                    </Link>
                    {subCat.children.length > 0 && (
                      <ul className="mt-2 space-y-2">
                        {subCat.children.map(child => (
                          <li key={child.id}>
                            <Link
                              href={`/categories/${child.id}`}
                              className="text-sm text-gray-600 hover:text-blue-600"
                            >
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Classifieds. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link href="/about" className="text-gray-500 hover:text-gray-600">
                About
              </Link>
              <Link href="/privacy" className="text-gray-500 hover:text-gray-600">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-gray-600">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-gray-500 hover:text-gray-600">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 
