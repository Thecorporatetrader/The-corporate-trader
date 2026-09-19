'use client';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const client = supabase;
    if (!client) { setLoading(false); return; }
    let active = true;
    let observed = false;
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      observed = true;
      if (active) { setUser(session?.user ?? null); setLoading(false); }
    });
    client.auth.getSession().then(({ data }) => {
      if (active && !observed) { setUser(data.session?.user ?? null); setLoading(false); }
    }).catch(() => { if (active) setLoading(false); });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);
  return { user, loading };
}

