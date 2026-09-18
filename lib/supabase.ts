import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// The community component gracefully falls back to its empty state until these
// public browser variables have been added to .env.local.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
