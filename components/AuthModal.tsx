'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signin' | 'signup'
}

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'buyer' as const
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  const authImage = "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&q=80"

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signin') {
        await signIn(formData.email, formData.password)
      } else {
        await signUp(formData.email, formData.password, {
          name: formData.name,
          role: formData.role
        })
      }
      setFormData({
        email: '',
        password: '',
        name: '',
        role: 'buyer'
      })
      onClose()
    } catch (err) {
      console.error('Auth error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 flex overflow-hidden">
        {/* Image Section */}
        <div className="hidden md:block w-1/2 relative">
          <Image
            src={authImage}
            alt="Authentication"
            fill
            className="object-cover"
            priority
            unoptimized={process.env.NODE_ENV === 'development'}
          />
          <div className="absolute inset-0 bg-brand-600/10 backdrop-blur-[2px]" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black/60 to-transparent">
            <h2 className="text-white text-3xl font-bold mb-2">Welcome to Obilli</h2>
            <p className="text-white/90 text-lg">
              Join our community to buy and sell with ease
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    I want to
                  </label>
                  <div className="grid grid-cols-2 gap-4 mt-1">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: 'buyer' }))}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        formData.role === 'buyer'
                          ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-600'
                          : 'border-gray-200 dark:border-gray-700 hover:border-brand-600'
                      }`}
                    >
                      Buy Items
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: 'seller' }))}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        formData.role === 'seller'
                          ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-600'
                          : 'border-gray-200 dark:border-gray-700 hover:border-brand-600'
                      }`}
                    >
                      Sell Items
                    </button>
                  </div>
                </div>
              </>
            )}

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('signin')}
                  className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
