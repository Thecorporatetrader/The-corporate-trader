import { TIERS, type Tier } from './types';

export interface RegistrationInput {
  fullName: string;
  email: string;
  handle: string; // public trader handle
  mt5Account: string; // MT5 login number
  mt5Server: string; // e.g. "Exness-MT5Real8"
  investorPassword: string; // READ-ONLY password, never the trading/master password
  tier: Tier;
  ibCode?: string;
  consent: boolean;
}

export type FieldErrors = Partial<Record<keyof RegistrationInput, string>>;

/** Used by BOTH the modal (instant feedback) and the server action (the real check). */
export function validateRegistration(i: RegistrationInput): FieldErrors {
  const e: FieldErrors = {};
  if (i.fullName.trim().length < 2 || i.fullName.trim().length > 80) e.fullName = 'Enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.email.trim()) || i.email.length > 254) e.email = 'Enter a valid email.';
  if (!/^[A-Za-z0-9_.-]{3,24}$/.test(i.handle.trim()))
    e.handle = '3–24 characters: letters, numbers, _ . -';
  if (!/^\d{5,12}$/.test(i.mt5Account.trim())) e.mt5Account = 'MT5 account number: digits only (5–12).';
  if (i.mt5Server.trim().length < 2 || i.mt5Server.trim().length > 80) e.mt5Server = 'Enter your broker server name.';
  if (i.investorPassword.length < 1 || i.investorPassword.length > 100)
    e.investorPassword = 'Enter your investor (read-only) password.';
  if (!TIERS.some((t) => t.id === i.tier)) e.tier = 'Choose a tier.';
  if (i.ibCode && !/^[A-Za-z0-9_-]{1,32}$/.test(i.ibCode.trim())) e.ibCode = 'Letters, numbers, - and _ only.';
  if (!i.consent) e.consent = 'You must accept the rules and read-only tracking.';
  return e;
}
