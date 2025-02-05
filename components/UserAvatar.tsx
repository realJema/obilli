'use client'

import Image from 'next/image'

const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'

interface UserAvatarProps {
  src?: string | null
  alt: string
  size?: number
}

export default function UserAvatar({ src, alt, size = 40 }: UserAvatarProps) {
  return (
    <div 
      className={`relative rounded-full overflow-hidden bg-gray-100`}
      style={{ width: size, height: size }}
    >
      <Image
        src={src || DEFAULT_AVATAR}
        alt={alt}
        fill
        className="object-cover"
        sizes={`${size}px`}
        unoptimized={process.env.NODE_ENV === 'development'}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = DEFAULT_AVATAR;
        }}
      />
    </div>
  )
} 
