import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'
import { createHash } from 'crypto'

export async function createUserRecord(authUser: User) {
  try {
    // First check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', authUser.id)
      .single()

    if (!existingUser) {
      // Create a hash of the auth user's ID as a placeholder for password_hash
      const tempHash = createHash('sha256')
        .update(authUser.id)
        .digest('hex')

      // Create new user record with all required fields
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          auth_user_id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Anonymous',
          email: authUser.email,
          password_hash: tempHash, // Required field
          role: 'buyer',
          profile_picture: authUser.user_metadata?.avatar_url || null,
          phone: authUser.phone || null,
          bio: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error inserting user record:', error)
        throw error
      }

      return newUser
    }

    return existingUser
  } catch (error) {
    console.error('Error in createUserRecord:', error)
    throw error
  }
} 
