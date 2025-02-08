'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPostAdPage = pathname?.startsWith('/post-ad')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    async function fetchCategories() {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      
      if (error) {
        console.error('Error fetching categories:', error)
        return
      }
      
      setCategories(categories || [])
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
