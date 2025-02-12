'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { DEFAULT_IMAGES } from '@/lib/constants'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'
import { Review as BaseReview } from '@/types/reviews'

// Define our Reviewer interface
interface Reviewer {
  id: number
  name: string | null
  profile_picture: string | null
  role: string
}

// Create a new Review type that omits the reviewer property from BaseReview
type ReviewWithoutReviewer = Omit<BaseReview, 'reviewer'>

// Then create our ReviewWithReplies interface
interface ReviewWithReplies extends ReviewWithoutReviewer {
  reviewer: Reviewer[]  // Add our array version of reviewer
  replies?: ReviewWithReplies[]
}

// Lift ReviewForm component outside the main component
function ReviewForm({ 
  onSubmit, 
  onCancel, 
  isSubmitting, 
  error, 
  parentId,
  initialRating = 0
}: { 
  onSubmit: (rating: number | null, comment: string) => void
  onCancel: () => void
  isSubmitting: boolean
  error: string
  parentId?: number
  initialRating?: number
}) {
  const [rating, setRating] = useState(initialRating)
  const [comment, setComment] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(parentId ? null : rating, comment)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!parentId && (
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      )}
      
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={parentId ? "Write a reply..." : "Write your review..."}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500"
        rows={4}
        required
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
        >
          {isSubmitting ? 'Submitting...' : parentId ? 'Reply' : 'Submit Review'}
        </button>
      </div>
    </form>
  )
}

// Add this helper function at the top of the file
function formatReviewTime(date: string) {
  const now = new Date()
  const reviewDate = new Date(date) // This will convert UTC to local time
  const diffInSeconds = Math.floor((now.getTime() - reviewDate.getTime()) / 1000)

  // If less than a minute ago
  if (diffInSeconds < 60) {
    return 'just now'
  }
  
  // If less than an hour ago, show minutes
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  }

  // Otherwise use formatDistanceToNow with the local time
  return formatDistanceToNow(reviewDate, { 
    addSuffix: true,
    includeSeconds: true
  })
    .replace('about ', '')
    .replace('less than a minute ago', 'just now')
}

// Update the component props
interface ReviewsProps {
  listingId: number
  sellerId: string | number
  initialReviews: BaseReview[]  // Use the imported type here
}

// Add a helper function to transform reviews
function transformReview(review: BaseReview): ReviewWithReplies {
  return {
    ...review,
    reviewer: [review.reviewer], // Convert single reviewer to array
    replies: []  // Initialize empty replies array
  }
}

export default function Reviews({ 
  listingId, 
  sellerId, 
  initialReviews = [] 
}: ReviewsProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<ReviewWithReplies[]>(
    initialReviews.map(transformReview)
  )
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showAllReviews, setShowAllReviews] = useState(false)

  useEffect(() => {
    loadReviews()
  }, [listingId])

  async function loadReviews() {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        updated_at,
        parent_id,
        reviewer_id,
        seller_id,
        reviewer:reviewer_id (
          id,
          name,
          profile_picture,
          role
        )
      `)
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading reviews:', error)
      return
    }

    // Organize reviews into threads using the transform function
    const reviewThreads = data.reduce((acc: ReviewWithReplies[], review) => {
      if (!review.parent_id) {
        const reviewWithReplies: ReviewWithReplies = {
          ...review,
          reviewer: review.reviewer,  // Already an array from Supabase
          replies: data
            .filter(r => r.parent_id === review.id)
            .map(reply => ({
              ...reply,
              reviewer: reply.reviewer,
              replies: []
            }))
        }
        acc.push(reviewWithReplies)
      }
      return acc
    }, [])

    setReviews(reviewThreads)
  }

  const handleSubmitReview = async (rating: number | null, comment: string, parentId?: number) => {
    if (!user) return
    
    setIsSubmitting(true)
    setError('')

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (userError) throw userError

      // Get current time with timezone offset
      const now = new Date()
      const offset = now.getTimezoneOffset() * 60000 // Convert offset to milliseconds
      const localTime = new Date(now.getTime() - offset).toISOString()

      const reviewData = {
        listing_id: listingId,
        seller_id: sellerId,
        reviewer_id: userData.id,
        rating: parentId ? null : (rating || 0),
        comment,
        parent_id: parentId || null,
        created_at: localTime,
        updated_at: localTime
      }

      const { error: submitError } = await supabase
        .from('reviews')
        .insert(reviewData)

      if (submitError) throw submitError

      // Reset form state and reload reviews
      setShowReviewForm(false)
      setReplyingTo(null)
      await loadReviews()
    } catch (error) {
      console.error('Error submitting review:', error)
      setError('Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter reviews for display
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 5)
  const hasMoreReviews = reviews.length > 5

  // Update ReviewCard component
  const ReviewCard = ({ review, isReply = false }: { review: ReviewWithReplies, isReply?: boolean }) => {
    const [showReplies, setShowReplies] = useState(true)
    const reviewer = review.reviewer[0] || {
      id: 0,
      name: null,
      profile_picture: null,
      role: 'user'
    }
    const hasReplies = review.replies && review.replies.length > 0

    return (
      <div className={`${isReply ? 'ml-8 mt-4' : 'border-b last:border-0'} py-4`}>
        <div className="flex items-start space-x-4">
          <div className="relative w-10 h-10 flex-shrink-0">
            <Image
              src={reviewer.profile_picture || DEFAULT_IMAGES.AVATAR}
              alt={reviewer.name || ''}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{reviewer.name || 'Anonymous'}</h4>
                {!isReply && review.rating && (
                  <div className="text-yellow-400">
                    {'★'.repeat(review.rating)}
                    <span className="text-gray-300">
                      {'★'.repeat(5 - review.rating)}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {formatReviewTime(review.created_at)}
              </span>
            </div>
            <p className="mt-2 text-gray-600">{review.comment}</p>
            
            {hasReplies && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                {showReplies ? (
                  <>
                    <ChevronUpIcon className="w-4 h-4" />
                    <span>Hide Replies</span>
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="w-4 h-4" />
                    <span>Show Replies</span>
                  </>
                )}
              </button>
            )}
            
            {/* Show replies if they exist and showReplies is true */}
            {hasReplies && showReplies && (
              <div className="mt-4">
                {review.replies?.map(reply => (
                  <ReviewCard key={reply.id} review={reply} isReply={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Reviews ({reviews.length})</h3>
        {user && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
          >
            Write a Review
          </button>
        )}
      </div>

      {showReviewForm && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <ReviewForm
            onSubmit={handleSubmitReview}
            onCancel={() => setShowReviewForm(false)}
            isSubmitting={isSubmitting}
            error={error}
          />
        </div>
      )}

      <div className="space-y-4">
        {visibleReviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
        
        {hasMoreReviews && (
          <button
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="w-full py-2 text-brand-600 hover:text-brand-700 flex items-center justify-center space-x-2"
          >
            <span>{showAllReviews ? 'Show Less' : `View All Reviews (${reviews.length})`}</span>
            {showAllReviews ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </div>
  )
} 
