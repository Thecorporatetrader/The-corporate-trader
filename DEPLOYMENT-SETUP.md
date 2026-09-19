# TCT account, premium community and contact setup

This is the full Next.js project, including prior market ticker, social-logo and hero-image changes.
It now needs Vercel's Next.js server runtime, NOT static export/GitHub Pages.

## 1. Database (required before using the forms)
Back up your Supabase project first.
- Existing project with community_comments: run supabase/account-security.sql once in SQL Editor.
- Brand new database: run supabase/schema.sql, then supabase/account-security.sql.
The migration retains existing comments, removes the previous public-posting policy,
and permits new posts/replies only from email-confirmed, verified active premium members.
Unauthenticated and expired/cancelled/unverified members can read but cannot post.
Subscriptions and profiles cannot be edited by browser users.

## 2. Vercel environment variables
Add for Production (and Preview if used):
- NEXT_PUBLIC_SUPABASE_URL: your project API URL, not the dashboard URL.
- NEXT_PUBLIC_SUPABASE_ANON_KEY: your public/anon key.
- SUPABASE_SERVICE_ROLE_KEY: server-only key from Supabase. NEVER prefix this with NEXT_PUBLIC,
  put it into a browser file, commit it to GitHub, or share it in chat.
The server-only key is necessary for private mobile-to-account lookup, message storage and rate limits.
Keep it in Vercel's Environment Variables UI. Redeploy after changes.
Framework preset: Next.js. Root directory: the folder containing package.json.
Leave build/output overrides off. Upload extracted files, not the ZIP itself, to your repository.
Do not upload .env.local, node_modules or .next.

## 3. Supabase Authentication settings
Enable email/password signups and Confirm Email.
Site URL: https://YOUR-DOMAIN
Allowed redirect URLs:
- https://YOUR-DOMAIN/login
- https://YOUR-DOMAIN/reset-password
Add the equivalent Vercel domain URLs for testing; use exact trusted URLs.
Password settings: minimum 9; require uppercase, lowercase, digits and symbols.
The app enforces the requested maximum of 14 characters at registration and password-reset UI.
Supabase's generic Auth API does not expose this same maximum-length setting; do not claim
the app's maximum prevents a modified client from calling Auth directly.
Default Supabase SMTP is for testing, limited to project-team recipients and low sending limits.
Configure custom SMTP for real public verification/reset emails. Supabase Auth can be used on
the free plan; an SMTP provider's own free limits and domain requirements are separate.
Docs: https://supabase.com/docs/guides/auth/auth-smtp

Mobile is a login identifier, not SMS-verified ownership. Email verification is required.
Users enter the full saved number, e.g. +919876543210, in the single login field.
Numbers without country code are intentionally not guessed.
New registrations save private profiles. Existing accounts without profiles can still use email login.
If necessary, add their verified name/country/mobile in account_profiles through the dashboard;
do not infer an existing user's mobile from untrusted requests.
The signup trigger expects name/country/mobile metadata. Admin-created accounts must supply
those fields too. Duplicate full phone numbers cannot be registered on two accounts.

## 4. Grant a premium subscription
Only after you independently verify payment and algo entitlement:
- In Authentication > Users, copy the user's UUID.
- In Table Editor > algo_subscriptions, add/update:
  user_id: that UUID
  status: active
  verified: true
  starts_at: subscription start date/time
  expires_at: actual future expiry date/time
Use verified=false or status=cancelled to revoke posting.
Do NOT give users a service key or permission to edit this table.
This is manual entitlement management; no payment processor or automatic billing webhook
was provided. There are no fake premium users seeded by this project.
The existing /admin prototype is not an entitlement-management interface.

## 5. Contact messages
Read new submissions in Table Editor > contact_messages.
The success popup confirms database storage, not email delivery to your support mailbox.
No automatic support email notification is configured.
Apply an appropriate privacy/retention policy to stored contact details.
The API limits login/registration/contact requests to 8 per 15 minutes per IP (login also per identifier).
Before broad launch, configure CAPTCHA/abuse protection in Supabase and Vercel.
Shared networks may hit the same IP limit. Database checks fail closed if not configured.

## 6. Acceptance checks before going live
1. Invalid names/emails, 7/16-digit mobiles and weak/8/15-character passwords are rejected.
2. Register using a real test inbox, verify email, sign in with email, then sign out and sign in with full mobile.
3. Auth buttons disappear on desktop/mobile after sign-in and return on sign-out.
4. Request an email reset, open its link, set a valid new password and sign in again.
5. Logged-out users see reviews but cannot post, including direct API attempts.
6. An email-verified user without subscription sees the specified friendly notice.
7. Grant a test subscription; submit a review and reply, check another browser for realtime updates.
8. Expire/revoke it and confirm further inserts are denied immediately by the database.
9. Submit a contact message; verify its row exists before trusting the success popup.
10. Confirm anon/authenticated clients cannot read contact_messages/account_profiles or modify subscriptions.
11. Check mobile/desktop hero sizing and social logos.

Local dependency installation was blocked by network permissions in this environment.
A production build and live email/database end-to-end tests must run after setup; this ZIP is not
a claim that those external services have already been configured or tested.

