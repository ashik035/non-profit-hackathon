// Supabase Client Configuration
// When remixing: Update VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file
// Get these values from: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// NOTE: generated Database types are empty for this project (external Supabase,
// no introspection yet), so the client is typed loosely as `any` to keep the
// app's .from("<table>") calls compiling. Re-introduce <Database> once types
// are regenerated.
export const supabase: SupabaseClient<any, any, any> = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);