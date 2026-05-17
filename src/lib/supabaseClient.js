import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[Supabase] Missing env variables VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Auth features will be disabled.'
  );
}

// supabase будет null если переменные не заданы — безопасный fallback для dev без backend
export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          // Хранить сессию в localStorage — стандартно для SPA
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true, // нужно для Magic Link callback
        },
      })
    : null;
