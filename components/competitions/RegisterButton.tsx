'use client';

import { useEffect, useState, useTransition, type FormEvent, type ReactNode } from 'react';
import { CheckCircle2, Loader2, ShieldAlert, Trophy, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/lib/useSession';
import { TIERS, type Tier } from '@/lib/competitions/types';
import {
  validateRegistration,
  type FieldErrors,
  type RegistrationInput,
} from '@/lib/competitions/validation';

interface Props {
  label?: string;
  competitionTitle?: string | null;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
  className?: string;
}

const EMPTY: RegistrationInput = {
  fullName: '',
  email: '',
  handle: '',
  mt5Account: '',
  mt5Server: '',
  investorPassword: '',
  tier: 'starter',
  ibCode: '',
  consent: false,
};

const inputCls =
  'w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-zinc-300">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-zinc-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-rose-400">{error}</span>}
    </label>
  );
}

export default function RegisterButton({
  label = 'Register for Next Month',
  competitionTitle,
  disabled = false,
  variant = 'primary',
  className = '',
}: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<RegistrationInput>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<{ code: string; message: string } | null>(null);
  const [done, setDone] = useState<{ message: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const { user, loading } = useSession();

  // prefill from the account once it is known
  useEffect(() => {
    if (!user) return;
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    const name = typeof meta.full_name === 'string' ? meta.full_name : typeof meta.name === 'string' ? meta.name : '';
    setForm((f) => ({ ...f, email: f.email || user.email || '', fullName: f.fullName || name }));
  }, [user]);

  // Esc to close + lock page scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const set = <K extends keyof RegistrationInput>(key: K, value: RegistrationInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function close() {
    setOpen(false);
    setDone(null);
    setFormError(null);
    setErrors({});
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const v = validateRegistration(form);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    startTransition(async () => {
      try {
        const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
        const token = data.session?.access_token;
        if (!token) {
          setFormError({ code: 'auth', message: 'Please log in or create an account to register.' });
          return;
        }
        const response = await fetch('/api/competitions/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(form),
        });
        const res = (await response.json().catch(() => null)) as
          | { ok: true; message: string }
          | { ok: false; code: string; message: string; fieldErrors?: FieldErrors }
          | null;
        if (res?.ok) {
          setDone({ message: res.message });
          setForm(EMPTY); // also clears the investor password from memory
        } else {
          setErrors(res?.fieldErrors ?? {});
          setFormError({ code: res?.code ?? 'server', message: res?.message ?? 'Something went wrong. Please try again.' });
        }
      } catch {
        setFormError({ code: 'server', message: 'Network error. Please try again.' });
      }
    });
  }

  const btn =
    variant === 'primary'
      ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
      : 'border border-zinc-700 text-zinc-100 hover:border-emerald-500/60 hover:text-white';

  const selectedTier = TIERS.find((t) => t.id === form.tier)!;

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${btn} ${className}`}
      >
        <Trophy className="h-4 w-4" aria-hidden />
        {disabled ? 'Registration opens soon' : label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(e) => e.target === e.currentTarget && close()}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="register-title"
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-zinc-800 bg-zinc-900 shadow-2xl sm:max-w-lg sm:rounded-2xl"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-zinc-800 bg-zinc-900/95 px-5 py-4 backdrop-blur">
              <div>
                <h2 id="register-title" className="text-lg font-semibold text-white">
                  Join the Championship
                </h2>
                {competitionTitle && <p className="mt-0.5 text-xs text-zinc-500">{competitionTitle}</p>}
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {done ? (
              <div className="px-5 py-10 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" aria-hidden />
                <h3 className="mt-4 text-lg font-semibold text-white">Registration received</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-400">{done.message}</p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-6 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
                >
                  Done
                </button>
              </div>
            ) : !loading && !user ? (
              <div className="px-5 py-10 text-center">
                <Trophy className="mx-auto h-10 w-10 text-emerald-400" aria-hidden />
                <h3 className="mt-4 text-lg font-semibold text-white">Log in to register</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-400">
                  You need a free TCT account (with a verified email) to join the championship.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <a href="/login" className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400">Log in</a>
                  <a href="/register" className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-100 hover:border-emerald-500/60">Create account</a>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-4 px-5 py-5">
                {formError && (
                  <div
                    role="alert"
                    className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-3 text-sm text-rose-200"
                  >
                    {formError.message}
                    {formError.code === 'auth' && (
                      <a
                        href="/login"
                        className="mt-2 block font-semibold text-emerald-300 underline underline-offset-2"
                      >
                        Log in / create account →
                      </a>
                    )}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" error={errors.fullName}>
                    <input
                      className={inputCls}
                      autoComplete="name"
                      value={form.fullName}
                      onChange={(e) => set('fullName', e.target.value)}
                    />
                  </Field>
                  <Field label="Email" error={errors.email}>
                    <input
                      type="email"
                      className={inputCls}
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                    />
                  </Field>
                </div>

                <Field label="Trader handle (shown publicly)" error={errors.handle} hint="3–24 characters. Use a nickname.">
                  <input
                    className={inputCls}
                    autoComplete="off"
                    value={form.handle}
                    onChange={(e) => set('handle', e.target.value)}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="MT5 account number" error={errors.mt5Account}>
                    <input
                      inputMode="numeric"
                      className={inputCls}
                      autoComplete="off"
                      value={form.mt5Account}
                      onChange={(e) => set('mt5Account', e.target.value.replace(/\D/g, ''))}
                    />
                  </Field>
                  <Field label="MT5 server" error={errors.mt5Server} hint="Exactly as in your terminal login">
                    <input
                      className={inputCls}
                      autoComplete="off"
                      placeholder="e.g. BrokerName-Real1"
                      value={form.mt5Server}
                      onChange={(e) => set('mt5Server', e.target.value)}
                    />
                  </Field>
                </div>

                <div>
                  <Field label="Investor (read-only) password" error={errors.investorPassword}>
                    <input
                      type="password"
                      className={inputCls}
                      autoComplete="new-password"
                      value={form.investorPassword}
                      onChange={(e) => set('investorPassword', e.target.value)}
                    />
                  </Field>
                  <p className="mt-2 flex gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs leading-relaxed text-amber-200/90">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden />
                    <span>
                      Use your <strong>investor</strong> password only. It can view the account but cannot trade. Never
                      enter your trading/master password here. Set or reset it in MT5: Navigator → right-click your account → Change Password (choose Investor), or in your broker portal.
                    </span>
                  </p>
                </div>

                <fieldset>
                  <legend className="mb-1.5 text-xs font-medium text-zinc-300">Capital tier</legend>
                  <div className="grid grid-cols-3 gap-2">
                    {TIERS.map((t) => {
                      const selected = form.tier === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => set('tier', t.id as Tier)}
                          className={`rounded-lg border px-2 py-2.5 text-center transition ${
                            selected
                              ? 'border-emerald-500 bg-emerald-500/10 text-white'
                              : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                          }`}
                        >
                          <span className="block text-sm font-semibold">{t.name}</span>
                          <span className="block text-[11px] text-zinc-500">{t.balanceRange}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-1.5 text-xs text-zinc-500">
                    {selectedTier.balanceRange} · min {selectedTier.minLots.toFixed(1)} lots · max{' '}
                    {selectedTier.maxDrawdown}% drawdown
                  </p>
                  {errors.tier && <span className="mt-1 block text-xs text-rose-400">{errors.tier}</span>}
                </fieldset>

                <Field label="IB referral code (optional)" error={errors.ibCode}>
                  <input
                    className={inputCls}
                    autoComplete="off"
                    value={form.ibCode ?? ''}
                    onChange={(e) => set('ibCode', e.target.value)}
                  />
                </Field>

                <div>
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-300">
                    <input
                      type="checkbox"
                      checked={form.consent}
                      onChange={(e) => set('consent', e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-zinc-600 bg-zinc-950 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span>
                      I accept the competition rules and authorise read-only tracking of my MT5 account for the duration
                      of the cycle.
                    </span>
                  </label>
                  {errors.consent && <span className="mt-1 block text-xs text-rose-400">{errors.consent}</span>}
                </div>

                <button
                  type="submit"
                  disabled={pending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-60"
                >
                  {pending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Connecting your account…
                    </>
                  ) : (
                    'Complete registration'
                  )}
                </button>
                <p className="text-center text-[11px] text-zinc-600">
                  Trading involves risk. Competition results are not indicative of future performance.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
