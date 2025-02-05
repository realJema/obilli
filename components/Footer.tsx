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
    <footer className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 transition-all duration-300">
      <div className="container mx-auto px-4 py-12">
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categoryTree.map(mainCat => (
            <div key={mainCat.id}>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                {mainCat.name}
              </h3>
              <div className="space-y-6">
                {mainCat.subcategories.map(subCat => (
                  <div key={subCat.id}>
                    <Link 
                      href={`/categories/${subCat.id}`}
                      className="font-medium text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300"
                    >
                      {subCat.name}
                    </Link>
                    {subCat.children.length > 0 && (
                      <ul className="mt-2 space-y-2">
                        {subCat.children.map(child => (
                          <li key={child.id}>
                            <Link
                              href={`/categories/${child.id}`}
                              className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300"
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
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} Obilli. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link href="/about" className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300">
                About
              </Link>
              <Link href="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 
