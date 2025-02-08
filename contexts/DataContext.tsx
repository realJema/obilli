'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Category {
  id: number
  name: string
  parent_id: number | null
  children?: Category[]
}

interface Location {
  id: number
  name: string
  parent_id: number | null
  children?: Location[]
}

interface DataContextType {
  categories: Category[]
  locations: Location[]
  categoriesTree: Category[]
  locationsTree: Location[]
  loading: boolean
  error: string | null
}

const DataContext = createContext<DataContextType>({
  categories: [],
  locations: [],
  categoriesTree: [],
  locationsTree: [],
  loading: true,
  error: null
})

// Helper function to build tree structure
const buildTree = (items: any[]) => {
  const itemMap: { [key: string]: any } = {}
  const roots: any[] = []

  // First pass: create nodes
  items.forEach(item => {
    itemMap[item.id] = { ...item, children: [] }
  })

  // Second pass: create relationships
  items.forEach(item => {
    if (item.parent_id && itemMap[item.parent_id]) {
      itemMap[item.parent_id].children.push(itemMap[item.id])
    } else if (!item.parent_id) {
      roots.push(itemMap[item.id])
    }
  })

  return roots
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [categoriesTree, setCategoriesTree] = useState<Category[]>([])
  const [locationsTree, setLocationsTree] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [{ data: categoriesData, error: catError }, { data: locationsData, error: locError }] = 
          await Promise.all([
            supabase.from('categories').select('*').order('name'),
            supabase.from('locations').select('*').order('name')
          ])

        if (catError) throw catError
        if (locError) throw locError

        if (categoriesData && locationsData) {
          setCategories(categoriesData)
          setLocations(locationsData)
          setCategoriesTree(buildTree(categoriesData))
          setLocationsTree(buildTree(locationsData))
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <DataContext.Provider 
      value={{
        categories,
        locations,
        categoriesTree,
        locationsTree,
        loading,
        error
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
} 
