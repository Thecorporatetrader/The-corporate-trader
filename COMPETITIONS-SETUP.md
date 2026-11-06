# Monthly Trading Championship – setup

1. Supabase SQL editor: run `supabase/competitions.sql`, then `supabase/competitions-seed.sql` (edit dates/title first).
2. Vercel env vars (see `.env.example`): `SUPABASE_SERVICE_ROLE_KEY`, `METAAPI_TOKEN`, `METAAPI_REGION`, `CRON_SECRET`. Redeploy.
3. Page: `/competitions` (shows demo data until a competition exists in the DB).
4. Registration: `POST /api/competitions/register` (Bearer token of the logged-in, email-verified user).
5. Sync job – call every ~5 min: `GET /api/competitions/sync` with header `Authorization: Bearer <CRON_SECRET>`.
   Vercel Hobby crons run once per day only, so use an external scheduler (cron-job.org, GitHub Actions schedule) or Vercel Pro.
6. Verify against MetaApi docs before launch: the deploy/delete endpoints in `lib/metaapi.ts` and your region host.
7. Rotate any API keys that were ever pasted in chat or committed (e.g. the old Delta Exchange key/secret).
