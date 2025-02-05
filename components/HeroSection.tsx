'use client'

export default function HeroSection() {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50">
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
          Welcome to <span className="text-brand-600 dark:text-brand-400">Obilli</span>
          <br />
          Your Community Marketplace
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Connect with local buyers and sellers. Find exactly what you're looking for, 
          or list your items to reach thousands of potential customers.
        </p>
      </div>
    </div>
  )
} 
