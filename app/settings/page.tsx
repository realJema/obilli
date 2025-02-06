'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { DEFAULT_IMAGES } from '@/lib/constants'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      // Load data from user metadata
      setName(user.user_metadata.name || '')
      setPhone(user.user_metadata.phone || '')
      setBio(user.user_metadata.bio || '')
      setPreviewUrl(user.user_metadata.profile_picture || '')
    }

    loadProfile()
  }, [user])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      let profilePictureUrl = previewUrl

      // Upload new profile image if selected
      if (profileImage) {
        const fileExt = profileImage.name.split('.').pop()
        const filePath = `${user.id}/${Date.now()}.${fileExt}`

        // Delete old profile image if exists
        if (previewUrl && previewUrl.includes('profile_images')) {
          const oldPath = previewUrl.split('/').pop()
          if (oldPath) {
            await supabase.storage
              .from('profile_images')
              .remove([`${user.id}/${oldPath}`])
          }
        }

        // Upload new image
        const { error: uploadError, data } = await supabase.storage
          .from('profile_images')
          .upload(filePath, profileImage, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('profile_images')
          .getPublicUrl(filePath)
        
        profilePictureUrl = publicUrl
      }

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          name,
          phone,
          bio,
          profile_picture: profilePictureUrl,
          updated_at: new Date().toISOString()
        }
      })

      if (updateError) throw updateError

      // Force refresh user session to get updated metadata
      const { data: { session }, error: refreshError } = await supabase.auth.refreshSession()
      if (refreshError) throw refreshError
      
      if (session) {
        // Verify the metadata was updated
        console.log('Updated metadata:', session.user.user_metadata)
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div className="container mx-auto px-4 py-8">Please sign in to access settings.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Profile Settings</h1>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profile Picture
              </label>
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                  <Image
                    src={previewUrl || DEFAULT_IMAGES.AVATAR}
                    alt="Profile"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = DEFAULT_IMAGES.AVATAR;
                    }}
                  />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-brand-50 file:text-brand-700
                    hover:file:bg-brand-100"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-white"
                placeholder="Your name"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-white"
                placeholder="Your phone number"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-white"
                placeholder="Tell us about yourself..."
              />
            </div>

            {message.text && (
              <p className={`text-sm ${
                message.type === 'error' ? 'text-red-500' : 'text-green-500'
              }`}>
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 
