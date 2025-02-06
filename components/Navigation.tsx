'use client'

import Link from 'next/link';
import { useState } from 'react';
import CategoryMenu from './CategoryMenu';
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu'

interface NavigationProps {
  categories: {
    id: number;
    name: string;
    parent_id: number | null;
    description?: string;
  }[];
}

export default function Navigation({ categories }: NavigationProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 relative">
      {/* Top Navigation Bar */}
      <div className="container mx-auto px-4 relative z-30">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-3xl font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
          >
            Obilli
          </Link>

          {/* Search and Theme Toggle */}
          <div className="flex-1 max-w-3xl mx-8">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search listings..."
                  className="w-full px-4 py-3 text-lg rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400"
                />
              </div>
              <ThemeToggle />
              <button
                type="submit"
                className="px-6 py-3 text-lg font-medium text-white bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 rounded-lg transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/post-ad"
              className="px-6 py-3 text-lg font-medium text-white bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 rounded-lg transition-colors"
            >
              Post Ad
            </Link>
            <UserMenu />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <input
                type="text"
                placeholder="Search listings..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
              />
              {categories
                .filter(cat => !cat.parent_id)
                .map(category => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.id}`}
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    {category.name}
                  </Link>
                ))}
              <Link
                href="/post-ad"
                className="block px-3 py-2 text-center text-white bg-brand-600 rounded-md hover:bg-brand-700"
              >
                Post Ad
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Categories Bar */}
      <div className="border-t relative z-20">
        <div className="container mx-auto relative">
          <CategoryMenu categories={categories} />
        </div>
      </div>

      {/* Overlay for dropdowns */}
      <div className="fixed inset-0 z-10 pointer-events-none"></div>
    </header>
  );
}
