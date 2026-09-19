import { NextResponse } from 'next/server';
import { serverClients, allowRequest, sameOrigin } from '@/lib/server';
import { identityError, validPassword, validEmail, passwordHelp } from '@/lib/validation';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
  if (!sameOrigin(request)) return reply({ error: 'Request not allowed.' }, 403);
  try {
    const raw = await request.text();
    if (raw.length > 4096) return reply({ error: 'Request too large.' }, 413);
    const values = JSON.parse(raw);
    const action = values.action;
    const password = typeof values.password === 'string' ? values.password : '';
    const identifier = typeof values.identifier === 'string' ? values.identifier.trim() : '';
    if (!['register', 'login'].includes(action)) return reply({ error: 'Invalid request.' }, 400);
    if (!await allowRequest(request, action, identifier)) return reply({ error: 'Too many attempts. Please wait 15 minutes and try again.' }, 429);
    const { admin, auth } = serverClients();
    if (action === 'register') {
      const name = typeof values.name === 'string' ? values.name.trim() : '';
      const email = typeof values.email === 'string' ? values.email.trim().toLowerCase() : '';
      const country = typeof values.country === 'string' ? values.country : '';
      const mobile = typeof values.mobile === 'string' ? values.mobile : '';
      const issue = identityError(name, email, country, mobile);
      if (issue || !validPassword(password)) return reply({ error: issue || passwordHelp }, 400);
      const { error } = await auth.auth.signUp({
        email, password,
        options: { emailRedirectTo: new URL('/login', request.url).href, data: { full_name: name, country_code: country, mobile_number: mobile } },
      });
      if (error) return reply({ error: 'Registration could not be completed. Check your details, or use sign in / password recovery if already registered.' }, 400);
      return reply({ ok: true });
    }
    if (!password || password.length > 128 || identifier.length > 254) return reply({ error: 'Invalid email/mobile or password.' }, 401);
    let email = identifier.toLowerCase();
    if (!validEmail(email)) {
      if (!/^\+?[1-9][0-9]{8,18}$/.test(identifier)) return reply({ error: 'Use an email or your full mobile number including country code.' }, 400);
      const phone = '+' + identifier.replace(/^\+/, '');
      const { data: profile } = await admin.from('account_profiles').select('user_id').eq('phone', phone).maybeSingle();
      if (profile) {
        const { data } = await admin.auth.admin.getUserById(profile.user_id);
        email = data.user?.email || '';
      } else email = '';
      // Always attempt password authentication; never expose the mapped email to callers.
      if (!email) email = 'unregistered-' + crypto.randomUUID() + '@invalid.example';
    }
    const { data, error } = await auth.auth.signInWithPassword({ email, password });
    if (error || !data.session || !data.user?.email_confirmed_at) return reply({ error: 'Invalid email/mobile or password, or email not yet verified.' }, 401);
    return reply({ session: { access_token: data.session.access_token, refresh_token: data.session.refresh_token } });
  } catch { return reply({ error: 'Account service is unavailable. Please contact TCT or try later.' }, 503); }
}

