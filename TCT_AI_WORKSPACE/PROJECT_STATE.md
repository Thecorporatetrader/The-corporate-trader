# PROJECT STATE

Last Updated: 2026-09-21
Updated By: Codex; repository inspection, documentation only
Baseline: main at 74ee6d74b40cd95d2fedc85e671af77e3be625a0
Repository: https://github.com/Thecorporatetrader/The-corporate-trader
Website: https://www.thecorporatetrader.com/

## Technology Stack

Frontend: Next.js ^15.5.0 App Router, React/React DOM ^19.1.0, TypeScript ^5.6.3 (declared dependency ranges, not installed versions).
Backend: Next.js Node-runtime routes for account and contact; Supabase RPCs.
Database: Supabase PostgreSQL schema/migration files; live database not inspected.
Authentication: Supabase JS ^2.49.1; email/password, email-or-mobile account login and Google OAuth.
Hosting: Vercel per deployment documentation; live deployment configuration not inspected.
Styling: Tailwind CSS ^3.4.17, PostCSS, app CSS and page styles.
State Management: React hooks; lib/useSession.ts observes Supabase session changes.
AI Provider: No connected AI provider identified in inspected code; not configured by this task.
Other services: TradingView embedded ticker; WhatsApp contact links; Supabase Realtime community updates.
No dependencies installed or application build run in this documentation task.

## Existing Routes

Pages discovered from app/**/page.tsx:
- /
- /admin
- /algo
- /articles
- /auth/callback
- /complete-profile
- /contact
- /dashboard
- /faq
- /famous-strategies/[slug]
- /get-access
- /help
- /journal
- /library
- /liquidity
- /liquidity-algo
- /login
- /markets
- /post
- /register
- /reset-password
- /strategies

API routes:
- POST /api/account (register/login)
- POST /api/contact

No /tct-auto page or /api/user/access endpoint is present at the inspected baseline. Earlier chat API examples were proposals, not existing endpoints.

## Existing Components

components/: AccountDashboard, AccountForm, CommunitySection, ContactForm, Footer, GoogleIcon, IdentityFields, MarketTicker, Nav, PhoneField, Site, SocialLinks, StrategyExampleChart.
components/Library/: DiagnosticQuizModal, LessonViewModal, ModuleCard, TradingAcademy, VisualChartDiagram.
Supporting modules: lib/server.ts, supabase.ts, useSession.ts, validation.ts, contact.ts, journal.ts, curriculum.ts, data.ts, famousStrategiesDetail.ts.
Academy lesson completion and quiz state currently use React state in TradingAcademy.

## Existing Supabase Tables

Discovered from supabase/schema.sql and account-security.sql, not live database introspection:
- community_comments: public reviews/replies; authenticated premium write policy and identity/rate-limit trigger.
- account_profiles: private full name and mobile information linked to auth.users.
- algo_subscriptions: user_id, status, verified, starts_at, expires_at.
- contact_messages: private contact submissions.
- request_limits: request throttling.
- auth.users: Supabase-managed identities referenced by migrations.

Relevant RPCs/functions: can_post_community, profile_mobile_missing, complete_mobile_profile, take_request_slot, create_account_profile, guard_community_post.
Existing premium rule in can_post_community(): current user's subscription is active and verified, starts_at <= now(), expires_at > now(); email confirmed and user not currently banned.
Authenticated/anonymous clients cannot edit subscription rows. Admin grants are manual.
No journal trade table was found in supplied migrations. Do not claim Android or journal syncing is implemented.

## Authentication

Google Login: WORKING

Evidence: owner explicitly confirms working Google login in supplied prompt; not independently exercised in this session.
DO NOT modify Google OAuth, Supabase callback URL, working authentication configuration or working Google login code unless owner specifically requests it.
Relevant files: components/AccountForm.tsx, lib/supabase.ts, lib/useSession.ts, app/auth/callback/page.tsx, app/complete-profile/page.tsx, app/api/account/route.ts, Supabase migrations.
Deployment setup instructions are historical; do not rerun migrations or change OAuth simply because older documentation says setup is required.
The account POST handler uses sameOrigin() and server-side rate limiting; it is not a confirmed native Android authentication API.
Never embed SUPABASE_SERVICE_ROLE_KEY in frontend or Android code. Its name is documented; no key values are recorded here.

## Current Products

Owner-defined target ecosystem (not a claim every feature is implemented):
- TCT Trading Journal: /journal is an Android product marketing page, not the native journal; lib/journal.ts Google Play URL is empty.
- TCT Execution Manager: existing /algo copy must be reconciled with this name and user-selected-level behavior.
- TCT Custom Bot Studio: existing /algo includes custom-build contact requests; full requested structured workflow is pending.
- TCT Auto — Coming Soon: requested /tct-auto route absent at baseline; /liquidity-algo exists and should be inspected before changing overlapping content.
- TCT Academy: /library and components/Library provide educational UI.
- TCT Assistant: requested; remaining architecture text is missing from the supplied prompt.

## Current Known Working Features

Owner-confirmed: Google login working.
Code-confirmed presence, not live test confirmation: registration/login/reset interfaces, session-aware navigation, community subscription enforcement SQL, private contact storage route, Academy components, TradingView ticker, journal marketing page.
Documentation workspace created in this task. No production behavior verified or altered.

## Known Problems

- Input prompt ends at SERVER-SIDE AP; Assistant architecture remainder unavailable.
- /algo metadata and request links contain “100%-automated” positioning, inconsistent with the new Execution Manager brief. Existing prices/free offers are not newly approved pricing; review with owner before changing commercial terms.
- /admin contains prototype/sample metrics and verification entries; it is not a secure entitlement administration system.
- /journal claims AI review; no connected journal AI service has been established by this inspection. Review capability claims before adding or extending them.
- Journal download is disabled while googlePlayUrl is empty.
- Native Android project is not part of this website checkout. The separately pasted Kotlin journal used in-memory trades and seeded examples; persistence and entitlement integration remain unverified.
- README identifies billing automation, MT5 integration, licensing and support email notifications as not implemented; this task has not added them.

## Session Boundary

LAST COMPLETED ACTION: Create the five handoff documents after inspecting the repository.
CURRENT FILE: TCT_AI_WORKSPACE/PROJECT_STATE.md
CURRENT TASK: Documentation foundation; no application implementation started.
WHAT IS WORKING: Owner-confirmed Google login; repository available locally.
WHAT IS NOT WORKING: No newly tested runtime failure claimed; gaps above remain.
NEXT EXACT ACTION: Read all five workspace files, then follow NEXT_TASKS.md.
DO NOT TOUCH: Working OAuth/authentication, production database/data, secret values.

