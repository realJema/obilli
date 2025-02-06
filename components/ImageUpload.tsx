'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { XMarkIcon } from '@heroicons/react/24/solid'

interface ImageUploadProps {
  images: File[]
  setImages: (images: File[]) => void
  maxImages?: number
}

export default function ImageUpload({ images, setImages, maxImages = 5 }: ImageUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const remainingSlots = maxImages - images.length
    const newImages = acceptedFiles.slice(0, remainingSlots)
    setImages([...images, ...newImages])
  }, [images, setImages, maxImages])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5242880, // 5MB
    disabled: images.length >= maxImages
  })

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-3 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10' : 'border-gray-300 dark:border-gray-600'}
          ${images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : 'hover:border-brand-500 dark:hover:border-brand-400'}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          {isDragActive ? (
            <p className="text-xl text-brand-600 dark:text-brand-400">Drop your images here...</p>
          ) : (
            <>
              <p className="text-xl text-gray-700 dark:text-gray-200">
                {images.length >= maxImages
                  ? `Maximum ${maxImages} images allowed`
                  : 'Drag & drop your images here'}
              </p>
              <p className="text-gray-500">
                or click to select files ({images.length}/{maxImages})
              </p>
            </>
          )}
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {images.map((file, index) => (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
              <Image
                src={URL.createObjectURL(file)}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 
