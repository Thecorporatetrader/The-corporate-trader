'use client';
import { FormEvent, useState } from 'react';
import { PageHero } from '@/components/Site';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/lib/useSession';
import { passwordHelp, validPassword } from '@/lib/validation';
export default function Page() {
  const { user, loading } = useSession();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = new FormData(e.currentTarget);
    const password = String(values.get('password'));
    if (!validPassword(password)) { setMessage(passwordHelp); return; }
    if (password !== values.get('confirm')) { setMessage('Passwords do not match.'); return; }
    if (!supabase || !user || busy) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) setMessage('Unable to change password. Request a new reset link and try again.');
      else { await supabase.auth.signOut(); setMessage('Password updated. You can now sign in with your new password.'); }
    } catch { setMessage('Connection failed. Please try again.'); }
    finally { setBusy(false); }
  }
  return <main><PageHero kicker="ACCOUNT" title="Choose a new password">{passwordHelp}</PageHero>
    <section className="container"><form className="card" onSubmit={submit}>
      {loading ? <p>Checking your reset link…</p> : !user ? <p>Open the reset link from your email, or <a className="good" href="/login">request a new link</a>.</p> : <>
        <label htmlFor="new-password" className="fieldlabel">New password</label><input id="new-password" className="input" name="password" type="password" autoComplete="new-password" minLength={9} maxLength={14} required />
        <label htmlFor="confirm-password" className="fieldlabel">Confirm password</label><input id="confirm-password" className="input" name="confirm" type="password" autoComplete="new-password" minLength={9} maxLength={14} required />
        <button className="btn primary" disabled={busy}>Update password</button>
      </>}
      <p role="status">{message}</p><a className="good" href="/login">Back to sign in</a>
    </form></section></main>;
}

