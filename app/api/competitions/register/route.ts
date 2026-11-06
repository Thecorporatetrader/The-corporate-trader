import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { allowRequest, sameOrigin, serverClients } from '@/lib/server';
import { createReadOnlyAccount, isMetaApiConfigured, removeAccount } from '@/lib/metaapi';
import { validateRegistration, type FieldErrors, type RegistrationInput } from '@/lib/competitions/validation';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type Code = 'auth' | 'validation' | 'closed' | 'duplicate' | 'verification' | 'rate' | 'server';
const fail = (status: number, code: Code, message: string, fieldErrors?: FieldErrors) =>
  NextResponse.json({ ok: false, code, message, fieldErrors }, { status, headers: { 'Cache-Control': 'no-store' } });

/**
 * POST /api/competitions/register   Authorization: Bearer <supabase access token>
 * Inserts the row AS THE USER (RLS enforces the rules), then connects the MT5 account for read-only
 * tracking with MetaApi. The investor password is used once and never stored or logged.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail(403, 'server', 'Invalid request origin.');
  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > 10_000) return fail(413, 'validation', 'Request too large.');

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  if (!token) return fail(401, 'auth', 'Please log in or create an account to register.');

  let input: RegistrationInput;
  try {
    input = (await request.json()) as RegistrationInput;
  } catch {
    return fail(400, 'validation', 'Invalid request.');
  }
  for (const k of ['fullName', 'email', 'handle', 'mt5Account', 'mt5Server', 'investorPassword', 'tier'] as const) {
    if (typeof input?.[k] !== 'string') return fail(400, 'validation', 'Invalid request.');
  }
  const fieldErrors = validateRegistration(input);
  if (Object.keys(fieldErrors).length > 0) {
    return fail(400, 'validation', 'Please fix the highlighted fields.', fieldErrors);
  }

  let clients: ReturnType<typeof serverClients>;
  try {
    clients = serverClients();
  } catch {
    return fail(500, 'server', 'Registration is temporarily unavailable.');
  }
  const { admin, auth } = clients;

  const { data: userData, error: userError } = await auth.auth.getUser(token);
  const user = userData?.user;
  if (userError || !user) return fail(401, 'auth', 'Your session expired. Please log in again.');
  if (!user.email_confirmed_at) return fail(403, 'auth', 'Please verify your email address before registering.');

  if (!(await allowRequest(request, 'competition-register', user.id))) {
    return fail(429, 'rate', 'Too many attempts. Please wait a few minutes and try again.');
  }

  // user-scoped client: RLS applies to this insert
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: comp } = await supabase
    .from('competitions')
    .select('id, title')
    .eq('registration_open', true)
    .gt('end_date', new Date().toISOString())
    .order('start_date', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!comp) return fail(409, 'closed', 'Registration is not open right now.');

  const { data: inserted, error } = await supabase
    .from('competition_participants')
    .insert({
      competition_id: comp.id,
      user_id: user.id,
      display_handle: input.handle.trim(),
      full_name: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      mt5_account_number: input.mt5Account.trim(),
      mt5_server: input.mt5Server.trim(),
      tier: input.tier,
      ib_code: input.ibCode?.trim() || null,
    })
    .select('id')
    .single();

  if (error || !inserted) {
    const msg = error?.message ?? '';
    if (error?.code === '23505') {
      if (msg.includes('user_uniq')) return fail(409, 'duplicate', "You're already registered for this competition.");
      if (msg.includes('mt5_uniq'))
        return fail(409, 'duplicate', 'That MT5 account is already registered.', { mt5Account: 'Already registered.' });
      if (msg.includes('handle'))
        return fail(409, 'duplicate', 'That trader handle is taken.', { handle: 'Handle already taken.' });
    }
    if (error?.code === '42501') return fail(409, 'closed', 'Registration is closed for this competition.');
    console.error('[competitions] insert failed', error?.code);
    return fail(500, 'server', 'Could not complete registration. Please try again.');
  }

  if (!isMetaApiConfigured()) {
    return NextResponse.json({
      ok: true,
      verified: false,
      message: "You're registered. We'll verify your MT5 account before the cycle starts.",
    });
  }

  try {
    const account = await createReadOnlyAccount({
      name: `tct-${comp.id.slice(0, 8)}-${input.mt5Account.trim()}`,
      login: input.mt5Account.trim(),
      investorPassword: input.investorPassword,
      server: input.mt5Server.trim(),
    });
    const { error: updateError } = await admin
      .from('competition_participants')
      .update({ metaapi_account_id: account.id })
      .eq('id', inserted.id);
    if (updateError) {
      await removeAccount(account.id).catch(() => undefined);
      await admin.from('competition_participants').delete().eq('id', inserted.id);
      return fail(500, 'server', 'Could not complete registration. Please try again.');
    }
    return NextResponse.json({
      ok: true,
      verified: true,
      message: "You're in! Your MT5 account is connected for read-only tracking.",
    });
  } catch (e) {
    await admin.from('competition_participants').delete().eq('id', inserted.id);
    console.error('[competitions] MetaApi connect failed:', e instanceof Error ? e.message : 'unknown');
    return fail(
      422,
      'verification',
      "We couldn't connect to that MT5 account. Check the account number, the exact server name, and that you entered the INVESTOR (read-only) password.",
      { investorPassword: 'Check this password', mt5Server: 'Check the server name' },
    );
  }
}
