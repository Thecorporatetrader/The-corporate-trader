'use client';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHero } from '@/components/Site';
import { useSession } from '@/lib/useSession';
import { supabase } from '@/lib/supabase';
import { PhoneField } from '@/components/PhoneField';

export default function Page() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }
    const client = supabase;
    if (!client) { setChecked(true); return; }
    let active = true;
    client.rpc('profile_mobile_missing').then(({ data, error }) => {
      if (!active) return;
      if (!error && data === false) router.replace('/dashboard');
      else setChecked(true);
    });
    return () => { active = false; };
  }, [user, loading, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError('');
    const values = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    const client = supabase;
    if (!client) { setError('Account services are not configured yet. Please contact TCT.'); return; }
    setBusy(true);
    try {
      const { error } = await client.rpc('complete_mobile_profile', {
        p_country_code: values.country, p_mobile_number: values.mobile,
      });
      if (error) throw new Error('Enter a valid country code and an 8\u201315 digit mobile number.');
      router.replace('/dashboard');
    } catch (err) { setError(err instanceof Error ? err.message : 'Connection failed. Please try again.'); }
    finally { setBusy(false); }
  }

  return <main>
    <PageHero kicker="ACCOUNT" title="One more step">
      Google sign-in does not share a mobile number. Add yours to finish setting up your TCT account.
    </PageHero>
    <section className="container"><div className="twocol">
      {loading || !checked ? <div className="card"><p role="status">Checking your account…</p></div> : <form className="card" onSubmit={submit}>
        <h2>Add your mobile number</h2>
        <PhoneField />
        {error && <p role="alert" className="community-error">{error}</p>}
        <button className="btn primary" disabled={busy} type="submit">{busy ? 'Saving…' : 'Save and continue'}</button>
      </form>}
      <div className="card">
        <div className="eyebrow">WHY WE ASK</div>
        <h2>Used for account login only.</h2>
        <p>Your mobile number lets you sign in with your number instead of email. It does not grant premium algo access — that is verified separately by our team.</p>
      </div>
    </div></section>
  </main>;
}
