import { supabase } from './supabase'

export async function uploadImage(file: File, path: string) {
  try {
    console.log('Starting upload for file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      path: path
    })

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB')
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed')
    }

    // Create a unique filename with timestamp and original extension
    const timestamp = new Date().getTime()
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '')
    const fileName = `${timestamp}-${cleanFileName}`
    const filePath = `${path}/${fileName}`

    console.log('Attempting to upload file to:', filePath)

    // Upload the file directly
    const { data, error: uploadError } = await supabase.storage
      .from('ads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error details:', {
        status: uploadError.status,
        statusCode: uploadError.statusCode,
        message: uploadError.message,
        details: uploadError.details
      })
      throw new Error(`Failed to upload image: ${uploadError.message}`)
    }

    if (!data?.path) {
      console.error('No path returned from upload')
      throw new Error('No path returned from upload')
    }

    console.log('Upload successful:', data)

    // Get the public URL using the storage URL format
    const {
      data: { publicUrl },
    } = supabase.storage.from('ads').getPublicUrl(data.path)

    // Ensure the URL uses the correct format
    const finalUrl = publicUrl.replace(
      'object/public/',
      'object/public/ads/'
    )

    console.log('Generated public URL:', finalUrl)

    return finalUrl
  } catch (error) {
    console.error('Upload error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    throw error
  }
} 
