import { supabase } from './supabase'
import imageCompression from 'browser-image-compression'

export async function processImage(file: File, path: string): Promise<string> {
  try {
    // First compress the image
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: 0.8,
    }

    const compressedFile = await imageCompression(file, options)

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('listing_images')
      .upload(`${path}/${Date.now()}-${file.name}`, compressedFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw error
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('listing_images')
      .getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error('Error processing/uploading image:', error)
    throw error
  }
} 
