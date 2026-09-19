import { NextResponse } from 'next/server';
import { serverClients, allowRequest, sameOrigin } from '@/lib/server';
import { identityError } from '@/lib/validation';
export async function POST(request: Request) {
  const reply = (body: object, status = 200) => NextResponse.json(body, { status });
  if (!sameOrigin(request)) return reply({ error: 'Request not allowed.' }, 403);
  try {
    const raw = await request.text();
    if (raw.length > 10000) return reply({ error: 'Message too long.' }, 413);
    const v = JSON.parse(raw);
    const field = (key: string) => typeof v[key] === 'string' ? v[key].trim() : '';
    const name = field('name'), email = field('email'), country = field('country'), mobile = field('mobile'), message = field('message');
    const issue = identityError(name, email, country, mobile);
    if (issue || !message || message.length > 3000) return reply({ error: issue || 'Please enter a message of 1–3000 characters.' }, 400);
    if (!await allowRequest(request, 'contact')) return reply({ error: 'Too many messages. Please try again in 15 minutes.' }, 429);
    const { admin } = serverClients();
    const { error } = await admin.from('contact_messages').insert({ name, email, country_code: country, mobile_number: mobile, message });
    if (error) throw error;
    return reply({ ok: true });
  } catch { return reply({ error: 'Your message was not sent. Please try again or contact us directly.' }, 503); }
}

