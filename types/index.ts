export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  profile_picture?: string;
  role: 'admin' | 'seller' | 'buyer';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  parent_id?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: number;
  name: string;
  parent_id?: number;
  type: 'country' | 'region' | 'city' | 'other';
  created_at: string;
  updated_at: string;
}

export interface Ad {
  id: number;
  user_id: number;
  category_id: number;
  location_id: number;
  title: string;
  description?: string;
  price?: number;
  currency: string;
  status: 'active' | 'pending' | 'expired' | 'deleted';
  views_count: number;
  created_at: string;
  updated_at: string;
  images?: AdImage[];
  user?: User;
  category?: Category;
  location?: Location;
}

export interface AdImage {
  id: number;
  ad_id: number;
  image_url: string;
  caption?: string;
  created_at: string;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  ad_id?: number;
  message_text: string;
  read_status: 'read' | 'unread';
  sent_at: string;
  sender?: User;
  receiver?: User;
  ad?: Ad;
}

export interface Review {
  id: number;
  reviewer_id: number;
  seller_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer?: User;
  seller?: User;
}

export interface Notification {
  id: number;
  user_id: number;
  message: string;
  type?: string;
  is_read: boolean;
  created_at: string;
}
