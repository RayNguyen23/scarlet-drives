import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type FileRecord = {
  id: string
  name: string
  size: number
  type: string
  folder_path: string
  created_at: string
  updated_at: string
  user_id: string
  is_starred: boolean
  is_shared: boolean
}