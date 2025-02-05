/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'kkvwmbzcvsskgldsfveb.supabase.co',
      'images.unsplash.com',
      'plus.unsplash.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      }
    ]
  }
}

module.exports = nextConfig 
