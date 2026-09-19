'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHero } from '@/components/Site';
import { useSession } from '@/lib/useSession';
import { supabase } from '@/lib/supabase';
export function AccountDashboard() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [profileChecked, setProfileChecked] = useState(false);
  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    const client = supabase;
    let active = true;
    if (user && client) {
      // Same guard as /auth/callback: accounts with no mobile yet (first-time Google users, or a returning
      // session on a new device before the number was saved) must finish /complete-profile first.
      client.rpc('profile_mobile_missing').then(({ data, error }) => {
        if (!active) return;
        if (!error && data === true) { router.replace('/complete-profile'); return; }
        setProfileChecked(true);
      });
      client.rpc('can_post_community').then(({ data, error }) => { if (active) setEligible(!error && data === true); });
    }
    return () => { active = false; };
  }, [user, loading, router]);
  if (loading || !user || !profileChecked) return <main className="container"><p role="status">Checking your account…</p></main>;
  return <main><PageHero kicker="USER DASHBOARD" title="Your TCT Account">Your private Android journal remains on your device.</PageHero>
    <section className="container"><div className="twocol">
      <div className="card"><h2>Account</h2><p>{user.email}</p><p>{user.email_confirmed_at ? 'Email verified' : 'Email verification required'}</p></div>
      <div className="card"><h2>Premium algo community</h2><p>{eligible === null ? 'Checking access…' : eligible ? 'Your verified premium subscription is active. You can post reviews and comments.' : 'You are not an algo subscriber. Only verified algorithm users can add comments and reviews.'}</p><a className="btn primary" href="/#community">View community</a></div>
    </div></section></main>;
}
