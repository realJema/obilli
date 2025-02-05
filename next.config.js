/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'gravatar.com',
      'www.gravatar.com',
      'example.com',  // Replace with your actual image domain
      'localhost',
      'xsgames.co', // Common placeholder avatar domain
      process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '') || '', // For Supabase storage
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
}

module.exports = nextConfig 
