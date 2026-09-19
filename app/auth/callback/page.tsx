'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHero } from '@/components/Site';
import { useSession } from '@/lib/useSession';
import { supabase } from '@/lib/supabase';

export default function Page() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { setFailed(true); return; }
    const client = supabase;
    if (!client) { router.replace('/dashboard'); return; }
    let active = true;
    // First-time Google sign-ins have no mobile number yet; route them to complete it.
    client.rpc('profile_mobile_missing').then(({ data, error }) => {
      if (!active) return;
      router.replace(!error && data === true ? '/complete-profile' : '/dashboard');
    });
    return () => { active = false; };
  }, [user, loading, router]);

  return <main>
    <PageHero kicker="ACCOUNT" title="Signing you in">
      {failed ? 'Sign-in was not completed. Please try again.' : 'One moment while we finish setting up your session.'}
    </PageHero>
    <section className="container">
      <div className="card">
        <p role="status">{failed ? 'You can return to the login page and try Continue with Google again.' : 'Checking your Google sign-in…'}</p>
        {failed && <p><a className="good" href="/login">Back to sign in</a></p>}
      </div>
    </section>
  </main>;
}
