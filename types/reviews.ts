export interface Review {
  id: number
  rating: number
  comment: string
  created_at: string
  updated_at: string
  parent_id: number | null
  reviewer_id: number
  seller_id: number
  reviewer: {
    id: number
    name: string | null
    profile_picture: string | null
    role: string
  }
} 
