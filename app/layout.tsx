import { Inter } from 'next/font/google'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import './globals.css'
import { supabase } from '@/lib/supabase'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Classified Listings',
  description: 'Find and post classified ads',
}

async function getCategories() {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }
  
  return categories
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const categories = await getCategories()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all duration-300`}>
        <AuthProvider>
          <ThemeProvider>
            <div className="min-h-screen flex flex-col">
              <Navigation categories={categories} />
              <main className="container mx-auto px-4 py-8 flex-grow text-lg">
                {children}
              </main>
              <Footer categories={categories} />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
