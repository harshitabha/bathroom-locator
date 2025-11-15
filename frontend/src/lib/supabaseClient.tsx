import {createClient} from '@supabase/supabase-js';

const supabaseUrl=import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey=import.meta.env.VITE_SUPABASE_ANONKEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * gets id of user currently logged in
 * @returns {string} user id of logged in user
 */
export async function getCurrentUserId() {
  const {data: {user}, error} = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting current user: ', error.message);
    return null;
  }

  if (user) {
    return user.id;
  } else {
    return null;
  }
}

