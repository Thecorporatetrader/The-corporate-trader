'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Loader2, MessageCircle, Send, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/lib/useSession';

type Comment = {
  id: string;
  author_name: string;
  body: string;
  rating: number | null;
  parent_id: string | null;
  created_at: string;
};

const dateFormat = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

function relativeDate(value: string) {
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const divisions = [
    [60, 'second'], [60, 'minute'], [24, 'hour'], [7, 'day'], [4.34524, 'week'], [12, 'month'], [Infinity, 'year'],
  ] as const;
  let duration = seconds;
  for (const [amount, unit] of divisions) {
    if (Math.abs(duration) < amount) return dateFormat.format(duration, unit);
    duration /= amount;
  }
  return 'recently';
}

function Stars({ rating, interactive, onChange }: { rating: number; interactive?: boolean; onChange?: (rating: number) => void }) {
  return <div className="community-stars" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" className={star <= rating ? 'is-active' : ''} disabled={!interactive} onClick={() => onChange?.(star)} aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}><Star size={16} fill="currentColor" /></button>)}
  </div>;
}

export default function CommunitySection() {
  const { user, loading } = useSession();
  const [eligible, setEligible] = useState(false);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    const client = supabase;
    let active = true;
    setEligible(false);
    if (!client || !user) { setChecking(false); return; }
    setChecking(true);
    const check = async () => {
      const { data, error } = await client.rpc('can_post_community');
      if (active) { setEligible(!error && data === true); setChecking(false); }
    };
    check();
    const timer = window.setInterval(check, 60000);
    return () => { active = false; window.clearInterval(timer); };
  }, [user]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const load = async () => {
      const { data, error } = await client.from('community_comments').select('*').order('created_at', { ascending: false });
      if (error) setError('Community is being set up. Please check back shortly.');
      else setComments(data as Comment[]);
    };
    load();
    const channel = client.channel('landing-community')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_comments' }, (payload) => {
        if (payload.eventType === 'INSERT') setComments((current) => current.some((comment) => comment.id === payload.new.id) ? current : [payload.new as Comment, ...current]);
        if (payload.eventType === 'DELETE') setComments((current) => current.filter((comment) => comment.id !== payload.old.id));
      }).subscribe();
    return () => { client.removeChannel(channel); };
  }, []);

  const reviews = useMemo(() => comments.filter((comment) => !comment.parent_id), [comments]);
  const average = reviews.length ? reviews.reduce((total, review) => total + (review.rating ?? 0), 0) / reviews.length : 0;
  const replyCount = (id: string) => comments.filter((comment) => comment.parent_id === id);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!message.trim() || sending) return;
    if (!user || !eligible) { setError('You are not an algo subscriber. Only verified algorithm users can add comments and reviews.'); return; }
    if (!supabase) { setError('Add your Supabase public keys to enable live posting.'); return; }
    setSending(true); setError('');
    const { data, error } = await supabase.from('community_comments').insert({ user_id: user.id, author_name: 'Verified member', body: message.trim(), rating: replyTo ? null : rating, parent_id: replyTo }).select().single();
    if (error) setError('Unable to post. Check your verified subscription and wait 30 seconds between posts.');
    else { setComments((current) => current.some((comment) => comment.id === data.id) ? current : [data as Comment, ...current]); setMessage(''); setReplyTo(null); }
    setSending(false);
  }

  return <section className="container community-section" id="community">
    <div className="sectionhead reveal-up reveal-delay-1">
      <div><div className="eyebrow">TRADER COMMUNITY</div><h2>Real feedback. Real conversation.</h2></div>
      <p>Share your TCT experience, rate the platform, and exchange ideas with traders who value process.</p>
    </div>
    <div className="community-layout reveal-up reveal-delay-2">
      <div className="community-feed card">
        <div className="community-summary"><div className="score">{average ? average.toFixed(1) : '—'}</div><div><Stars rating={Math.round(average)} /><span>{reviews.length ? `${reviews.length} community review${reviews.length === 1 ? '' : 's'}` : 'Be the first to leave a review'}</span></div></div>
        <div className="review-list">
          {reviews.length === 0 && <div className="community-empty"><MessageCircle size={22} />No reviews yet. Your perspective can start the conversation.</div>}
          {reviews.map((review) => <article className="review" key={review.id}>
            <div className="review-avatar">{review.author_name.slice(0, 1).toUpperCase()}</div><div className="review-content"><div className="review-meta"><strong>{review.author_name}</strong><span>{relativeDate(review.created_at)}</span></div><Stars rating={review.rating ?? 0} /><p>{review.body}</p><button className="reply-button" onClick={() => setReplyTo(replyTo === review.id ? null : review.id)}>Reply</button>
              {replyCount(review.id).map((reply) => <div className="reply" key={reply.id}><div className="review-avatar">{reply.author_name.slice(0, 1).toUpperCase()}</div><div><div className="review-meta"><strong>{reply.author_name}</strong><span>{relativeDate(reply.created_at)}</span></div><p>{reply.body}</p></div></div>)}
            </div>
          </article>)}
        </div>
      </div>
      <aside className="community-form card">
        <div className="community-form-heading"><span className="live-dot" />LIVE COMMUNITY</div><h3>{replyTo ? 'Write a reply' : 'Rate your experience'}</h3><p>{replyTo ? 'Keep the discussion useful and respectful.' : 'Your feedback helps shape what we build next.'}</p>
        {loading || checking ? <p role="status">Checking posting access…</p> : !eligible ? <p role="status">You are not an algo subscriber. Only verified algorithm users can add comments and reviews.</p> : <form onSubmit={submit}>
          <p className="footnote">Posts use your registered name.</p>
          {!replyTo && <><label>Your rating</label><Stars rating={rating} interactive onChange={setRating} /></>}
          <label htmlFor="community-message">{replyTo ? 'Your reply' : 'Your review'}</label><textarea id="community-message" className="input community-textarea" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={600} placeholder={replyTo ? 'Add to the conversation…' : 'What has your experience been like?'} required />
          {error && <p className="community-error" role="alert">{error}</p>}<div className="community-form-actions">{replyTo && <button type="button" className="reply-button" onClick={() => setReplyTo(null)}>Cancel</button>}<button className="btn primary" type="submit" disabled={sending}>{sending ? <Loader2 className="spin" size={17} /> : <Send size={17} />}{sending ? 'Sending' : 'Post to community'}</button></div>
        </form>}
      </aside>
    </div>
  </section>;
}
