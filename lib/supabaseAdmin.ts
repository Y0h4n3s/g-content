import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase URL and/or Service Role Key are not defined in environment variables.');
}

// The admin client uses the service_role key to bypass RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
