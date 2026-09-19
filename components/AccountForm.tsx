'use client';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { identityError, validEmail, validPassword, passwordHelp } from '@/lib/validation';
import { IdentityFields } from './IdentityFields';
import { GoogleIcon } from './GoogleIcon';
export function AccountForm({ register = false, initialNotice = '' }: { register?: boolean; initialNotice?: string }) {
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [notice, setNotice] = useState(initialNotice);
  const [error, setError] = useState('');
  const [recover, setRecover] = useState(false);
  async function continueWithGoogle() {
    setError(''); setNotice('');
    const client = supabase;
    if (!client) { setError('Account services are not configured yet. Please contact TCT.'); return; }
    if (busy || googleBusy) return;
    setGoogleBusy(true);
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/auth/callback' },
      });
      // On success the browser navigates to Google; nothing further runs here.
      if (error) throw new Error('Unable to continue with Google right now. Please try again.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed. Please try again.');
      setGoogleBusy(false);
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError(''); setNotice('');
    const values = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    const password = values.password || '';
    if (register) {
      const issue = identityError(values.name.trim(), values.email.trim(), values.country, values.mobile);
      if (issue || !validPassword(password)) { setError(issue || passwordHelp); return; }
    }
    const client = supabase;
    if (!client) { setError('Account services are not configured yet. Please contact TCT.'); return; }
    setBusy(true);
    try {
      if (recover) {
        const email = values.identifier.trim();
        if (!validEmail(email)) throw new Error('Enter your registered email address to receive a reset link.');
        const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' });
        if (error) throw new Error('Unable to send a reset link right now. Please try again later.');
        setNotice('If an account exists for this email, a password reset link will be sent. Check your inbox and spam folder.');
      } else {
        const response = await fetch('/api/account', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...values, action: register ? 'register' : 'login' }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to continue. Please try again.');
        if (register) {
          window.location.assign('/login?registered=1');
          return;
        } else {
          const { error } = await client.auth.setSession(result.session);
          if (error) throw new Error('Unable to start your session. Please sign in again.');
          window.location.assign('/dashboard');
        }
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Connection failed. Please try again.'); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="card">
    <h2>{register ? 'Create account' : recover ? 'Reset your password' : 'Sign in'}</h2>
    {!recover && <>
      <button type="button" className="btn ghost google-btn" disabled={busy || googleBusy} onClick={continueWithGoogle}>
        <GoogleIcon /> {googleBusy ? 'Redirecting…' : register ? 'Sign up with Google' : 'Continue with Google'}
      </button>
      <p className="footnote">Google sign-in does not grant premium algo access on its own.</p>
      <div className="formdivider" role="separator" aria-label="or"><span>or use email</span></div>
    </>}
    {register ? <IdentityFields /> : <>
      <label className="fieldlabel" htmlFor="identifier">{recover ? 'Registered email' : 'Email or mobile number'}</label>
      <input id="identifier" name="identifier" className="input" type={recover ? 'email' : 'text'} autoComplete="username"
        placeholder={recover ? 'name@domain.com' : 'Email or +919876543210'} maxLength={254} required />
      {!recover && <p className="footnote">For mobile login, include your country code (for example +91). No spaces or separators.</p>}
    </>}
    {!recover && <>
      <label className="fieldlabel" htmlFor="password">Password</label>
      <input id="password" name="password" className="input" type="password" required
        autoComplete={register ? 'new-password' : 'current-password'} minLength={register ? 9 : undefined} maxLength={register ? 14 : 128}
        aria-describedby={register ? 'password-help' : undefined} />
      {register && <p id="password-help" className="footnote">{passwordHelp}</p>}
    </>}
    {error && <p role="alert" className="community-error">{error}</p>}
    {notice && <p role="status" className="good">{notice}</p>}
    <button className="btn primary" disabled={busy} type="submit">{busy ? 'Please wait…' : register ? 'Create account' : recover ? 'Send reset link' : 'Sign in'}</button>
    {!register && <p><button type="button" className="reply-button" onClick={() => { setRecover(!recover); setError(''); setNotice(''); }}>{recover ? 'Back to sign in' : 'Forgot password?'}</button></p>}
    <p>{register ? 'Already registered? ' : 'New to TCT? '}<Link className="good" href={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Create account'}</Link></p>
  </form>;
}

