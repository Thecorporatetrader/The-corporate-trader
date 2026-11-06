import 'server-only';
import { randomBytes } from 'crypto';

/**
 * Thin MetaApi (metaapi.cloud) wrapper — read-only use.
 *
 * Verified against MetaApi's docs:
 *   POST  mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts   (create account)
 *   GET   mt-client-api-v1.<region>.agiliumtrade.ai/users/current/accounts/:id/account-information
 *   GET   metastats-api-v1.<region>.agiliumtrade.ai/users/current/accounts/:id/metrics
 * NOT verified (could not read those doc pages): deploy / delete account. Check before go-live.
 *
 * Env: METAAPI_TOKEN (required), METAAPI_REGION (default "new-york" — use your account's region)
 */

const PROVISIONING = 'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai';
const region = () => process.env.METAAPI_REGION || 'new-york';
const clientHost = () => `https://mt-client-api-v1.${region()}.agiliumtrade.ai`;
const statsHost = () => `https://metastats-api-v1.${region()}.agiliumtrade.ai`;

export const isMetaApiConfigured = () => !!process.env.METAAPI_TOKEN;

export class MetaApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'MetaApiError';
  }
}

const token = () => {
  const t = process.env.METAAPI_TOKEN;
  if (!t) throw new MetaApiError(500, 'METAAPI_TOKEN is not set');
  return t;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function bodyText(res: Response) {
  try {
    return (await res.text()).slice(0, 300);
  } catch {
    return '';
  }
}

/** Create a cloud account from a login + INVESTOR (read-only) password. The password is never stored by us. */
export async function createReadOnlyAccount(p: {
  name: string;
  login: string;
  investorPassword: string;
  server: string;
}): Promise<{ id: string }> {
  const transactionId = randomBytes(16).toString('hex'); // 32 chars, reused while polling a 202
  const body = {
    name: p.name,
    type: 'cloud-g2',
    login: p.login,
    password: p.investorPassword,
    server: p.server,
    platform: 'mt5',
    magic: 0,
    metastatsApiEnabled: true, // lots / deposits history (MetaApi lists this as a paid option)
    tags: ['tct-competition'],
  };

  for (let attempt = 0; attempt < 8; attempt++) {
    const res = await fetch(`${PROVISIONING}/users/current/accounts`, {
      method: 'POST',
      headers: {
        'auth-token': token(),
        'transaction-id': transactionId,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (res.status === 200 || res.status === 201) {
      const json = (await res.json()) as { id: string };
      await deployAccount(json.id).catch(() => undefined); // best effort, see note above
      return { id: json.id };
    }
    if (res.status === 202) {
      const wait = Math.min(Number(res.headers.get('retry-after') ?? 2) || 2, 10);
      await sleep(wait * 1000);
      continue;
    }
    // never include the request body (it contains the password) in errors/logs
    throw new MetaApiError(res.status, `MetaApi create failed (${res.status}): ${await bodyText(res)}`);
  }
  throw new MetaApiError(504, 'MetaApi account creation timed out');
}

export async function deployAccount(accountId: string) {
  const res = await fetch(`${PROVISIONING}/users/current/accounts/${accountId}/deploy`, {
    method: 'POST',
    headers: { 'auth-token': token(), 'transaction-id': randomBytes(16).toString('hex') },
    cache: 'no-store',
  });
  if (!res.ok && res.status !== 204) throw new MetaApiError(res.status, `MetaApi deploy failed (${res.status})`);
}

export async function removeAccount(accountId: string) {
  const res = await fetch(`${PROVISIONING}/users/current/accounts/${accountId}`, {
    method: 'DELETE',
    headers: { 'auth-token': token(), 'transaction-id': randomBytes(16).toString('hex') },
    cache: 'no-store',
  });
  if (!res.ok && res.status !== 204 && res.status !== 404)
    throw new MetaApiError(res.status, `MetaApi remove failed (${res.status})`);
}

export interface AccountInformation {
  balance: number;
  equity: number;
  currency: string;
  login?: string;
  server?: string;
}

/** Live balance/equity from the terminal state. Throws on 404 (not deployed yet) etc. */
export async function getAccountInformation(accountId: string): Promise<AccountInformation> {
  const res = await fetch(`${clientHost()}/users/current/accounts/${accountId}/account-information`, {
    headers: { 'auth-token': token(), Accept: 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new MetaApiError(res.status, `account-information failed (${res.status})`);
  return (await res.json()) as AccountInformation;
}

export interface AccountMetrics {
  balance: number;
  equity: number;
  deposits: number; // cumulative deposits (see README: verify how withdrawals are reported)
  lots: number; // total closed volume, all-time
  trades: number;
  profit: number;
}

/** MetaStats metrics. Returns null while MetaApi is still calculating (HTTP 202). */
export async function getMetrics(accountId: string): Promise<AccountMetrics | null> {
  const res = await fetch(`${statsHost()}/users/current/accounts/${accountId}/metrics`, {
    headers: { 'auth-token': token(), Accept: 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(30_000),
  });
  if (res.status === 202) return null;
  if (!res.ok) throw new MetaApiError(res.status, `metrics failed (${res.status})`);
  const json = (await res.json()) as { metrics: AccountMetrics };
  return json.metrics;
}
