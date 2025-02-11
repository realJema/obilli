'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function SignUpForm() {
  const { signUp } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'buyer',
    bio: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await signUp(formData.email, formData.password, {
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        bio: formData.bio
      })
    } catch (err) {
      console.error('Sign up error:', err)
      setError((err as Error).message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium">
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium">
          Role
        </label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
        </select>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          rows={3}
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
      >
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  )
} 
