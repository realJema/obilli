'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'

// Add interface for category
interface Category {
  id: number
  name: string
  parent_id: number | null
  description?: string
}

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPostAdPage = pathname?.startsWith('/post-ad')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data: categories } = await supabase
          .from('categories')
          .select('*')
          .order('name')

        // Now TypeScript knows categories is Category[] | null
        setCategories(categories || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {!isPostAdPage && <Navigation categories={categories} />}
      <main className="container mx-auto px-4 py-8 flex-grow text-lg">
        {children}
      </main>
      {!isPostAdPage && <Footer categories={categories} />}
    </div>
  )
} 
