export interface Database {
  public: {
    Tables: {
      ads: {
        Row: {
          id: number
          user_id: number
          category_id: number
          location_id: number
          title: string
          description: string | null
          price: number | null
          currency: string
          status: 'active' | 'pending' | 'expired' | 'deleted'
          views_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['ads']['Row'], 'id' | 'created_at' | 'updated_at' | 'views_count'>
        Update: Partial<Database['public']['Tables']['ads']['Insert']>
      }
      categories: {
        Row: {
          id: number
          name: string
          parent_id: number | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      locations: {
        Row: {
          id: number
          name: string
          parent_id: number | null
          type: 'country' | 'region' | 'city' | 'other'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['locations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['locations']['Insert']>
      }
      listings: {
        Row: {
          id: number
          user_id: string
          category_id: number
          location_id: number
          title: string
          description: string | null
          price: number | null
          currency: string
          status: 'active' | 'pending' | 'expired' | 'deleted'
          views_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['listings']['Row'], 'id' | 'created_at' | 'updated_at' | 'views_count'>
        Update: Partial<Database['public']['Tables']['listings']['Insert']>
      }
    }
    Views: {
      public_profiles: {
        Row: {
          id: string
          name: string | null
          profile_picture: string | null
          role: string | null
        }
      }
    }
  }
} 
