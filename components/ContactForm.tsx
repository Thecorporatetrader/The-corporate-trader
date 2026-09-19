'use client';
import { FormEvent, useRef, useState } from 'react';
import { IdentityFields } from './IdentityFields';
import { identityError } from '@/lib/validation';
export function ContactForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const issue = identityError(values.name.trim(), values.email.trim(), values.country, values.mobile);
    if (issue || !values.message.trim()) { setError(issue || 'Please enter your message.'); return; }
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      form.reset();
      dialog.current?.showModal();
    } catch (err) { setError(err instanceof Error ? err.message : 'Your message was not sent. Please try again.'); }
    finally { setBusy(false); }
  }
  return <>
    <form className="card" onSubmit={submit}><h2>Contact</h2><IdentityFields />
      <label className="fieldlabel" htmlFor="contact-message">Message</label>
      <textarea id="contact-message" className="input" name="message" rows={6} placeholder="Message" required maxLength={3000} />
      {error && <p className="community-error" role="alert">{error}</p>}
      <button className="btn primary" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button>
    </form>
    <dialog ref={dialog} className="success-dialog" aria-labelledby="contact-success">
      <h2 id="contact-success">Thank you!</h2><p>Thank you! Our team will contact you shortly.</p>
      <button className="btn primary" autoFocus onClick={() => dialog.current?.close()}>OK</button>
    </dialog>
  </>;
}

