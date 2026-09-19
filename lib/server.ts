import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'node:crypto';
export function serverClients() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !secret) throw new Error('Server configuration missing');
  const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
  return { admin: createClient(url, secret, options), auth: createClient(url, anon, options), secret };
}
export async function allowRequest(request: Request, scope: string, identifier = '') {
  const { admin, secret } = serverClients();
  // Vercel supplies this header; never accept an IP address from request JSON.
  const ip = request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const keys = [scope + ':ip:' + ip];
  if (identifier) keys.push(scope + ':identifier:' + identifier.toLowerCase());
  for (const key of keys) {
    const hash = createHmac('sha256', secret).update(key).digest('hex');
    const { data, error } = await admin.rpc('take_request_slot', { bucket_key: hash });
    if (error || data !== true) return false;
  }
  return true;
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  return origin === new URL(request.url).origin;
}

