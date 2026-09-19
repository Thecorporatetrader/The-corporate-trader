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


## 7. Google sign-in ("Continue with Google")
Login and Register pages show a Continue with Google button. It uses Supabase's Google provider;
no new environment variables are needed on Vercel.

1. Re-run the database migration (required on existing projects).
   Re-run supabase/account-security.sql in SQL Editor (safe to run again). It makes country_code and
   mobile_number nullable, replaces the signup trigger so Google names cannot break account creation,
   and creates the profile_mobile_missing() and complete_mobile_profile() functions that /auth/callback,
   /complete-profile and /dashboard call. Until it is re-run, Google sign-in will land on a broken
   profile step. The earlier note that the signup trigger expects name/country/mobile metadata now
   applies to email signups only; an account without a mobile number is sent to /complete-profile.
2. Create Google OAuth credentials (Google Cloud Console, https://console.cloud.google.com/).
   - APIs & Services > OAuth consent screen: set the app name, support email and developer contact.
     Scopes needed: openid, email, profile (the defaults). Publish the app to production, otherwise
     only listed test users can sign in.
   - APIs & Services > Credentials > Create credentials > OAuth client ID > Web application.
   - Authorized JavaScript origins: https://YOUR-DOMAIN (add your Vercel test domain if used).
   - Authorized redirect URIs: the callback URL Supabase shows on its Google provider page,
     https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback (this is Supabase's URL, not your site's).
   - Copy the Client ID and Client Secret. Keep the secret out of GitHub and out of chat.
3. Enable the provider in Supabase.
   Authentication > Providers > Google: turn it on, paste the Client ID and Client Secret, save.
   Guide: https://supabase.com/docs/guides/auth/social-login/auth-google
4. Allow the new redirect in Supabase.
   Authentication > URL Configuration > Redirect URLs: add https://YOUR-DOMAIN/auth/callback
   alongside the existing https://YOUR-DOMAIN/login and https://YOUR-DOMAIN/reset-password entries
   (and the equivalent Vercel test URL). Keep Site URL as https://YOUR-DOMAIN. If the redirect is not
   allowed, Google sign-in returns to the Site URL instead of /auth/callback and no session is created.

How it behaves:
- A Google user's email is already verified by Google, so no verification email is sent.
- Google does not supply a mobile number. First-time users are sent to /complete-profile to add one.
  It can be saved once only; the database refuses to overwrite an existing number.
- Google sign-in NEVER grants premium access. Nothing inserts into algo_subscriptions automatically;
  premium stays manual admin entitlement as described in section 4.
- Google users have no password. They can set one with Forgot password (a reset link goes to their
  Google email) if they want to sign in with email or mobile plus password.
- Supabase normally links a Google sign-in to an existing account that has the same verified email
  instead of creating a second account. Check the linking behaviour under Authentication settings.

Acceptance check for Google sign-in:
1. Use a Google account that has never signed in to TCT and click Continue with Google.
2. Approve the Google prompt; you land on /auth/callback, then automatically on /complete-profile.
3. Enter a country code and a valid 8-15 digit mobile number, and submit.
4. You land on /dashboard showing the account email as verified and the standard, non-premium message
   ("You are not an algo subscriber...").
5. Sign out and sign in with Google again: you go straight to /dashboard and are not asked for a mobile.
6. Open /dashboard directly in a fresh profile for a Google account with no saved mobile: you are sent to
   /complete-profile. Confirm the account has no row in algo_subscriptions.
7. Submitting the same mobile number for a second account is refused (phone numbers are unique).
