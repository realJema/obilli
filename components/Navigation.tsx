'use client'

import Link from 'next/link';
import { useState } from 'react';
import CategoryMenu from './CategoryMenu';

interface NavigationProps {
  categories: {
    id: number;
    name: string;
    parent_id: number | null;
    description?: string;
  }[];
}

export default function Navigation({ categories }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white shadow-lg relative">
      {/* Top Navigation Bar */}
      <div className="container mx-auto px-4 relative z-30">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold">
            Classifieds
          </Link>

          {/* Desktop Search and Actions */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-2xl mx-8">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search listings..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="absolute right-3 top-2.5">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
            <Link
              href="/listings/create"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 whitespace-nowrap"
            >
              Post Ad
            </Link>
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
                href="/listings/create"
                className="block px-3 py-2 text-center text-white bg-blue-500 rounded-md hover:bg-blue-600"
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
