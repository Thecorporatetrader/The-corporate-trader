# The Corporate Trader (TCT) — Frontend Prototype

Next.js (App Router) responsive frontend for TCT, written in TypeScript and styled with
Tailwind CSS.

## Project root (important for Vercel)

The ZIP contains a single top-level folder, `tct-website/`, and **that folder is the project
root** — it is the directory containing `package.json`, `next.config.mjs` and `app/`.

When importing into Vercel, set **Root Directory = `tct-website`** (if you upload/push the ZIP
contents as-is). If you instead push only the *contents* of `tct-website/` to the repository
root, leave Root Directory blank. Framework preset: **Next.js**. Build command `npm run build`,
output handled automatically.

## Run

1. Install Node.js 20+
2. `npm install`
3. `npm run dev`
4. Open http://localhost:3000

## Deploying without a backend

`next.config.mjs` is set to `output: 'export'`, so `npm run build` produces a plain
static site in `./out` — no Node server needed. Upload that folder to any static host:
Vercel, Netlify, GitHub Pages, or your existing cPanel/shared hosting.

Remove `output: 'export'` once real forms, auth, or API routes are added (static export
can't run server-side code — see "Production work still required" below).

## Project structure

```
app/            Route segments (one folder per page), each a typed React server component
components/     Shared UI: Nav (client), Footer (client), PageHero, re-exported icons
components/Nav.tsx     Eleven-item primary navigation + mobile drawer
components/Footer.tsx  Four-column dark-navy site footer + back-to-top
components/Site.tsx    PageHero; re-exports Nav/Footer/icons for existing imports
lib/            Static content/data modules (products, articles, library categories)
app/globals.css Tailwind directives + design-token component classes (@layer components)
tailwind.config.ts  Design tokens: bg/panel/text/muted/cyan/green/red/line colors
```

Import alias `@/*` is configured in `tsconfig.json` — use `@/components/Site`, `@/lib/data`,
etc. instead of relative paths.

## Navigation

The primary navigation order is defined once, in `components/Nav.tsx`, and is mirrored by the
footer link columns:

| # | Label | Destination |
|---|-------|-------------|
| 1 | Homepage | `/` |
| 2 | Trading Journal | `/journal` |
| 3 | TCT Algo | `/algo` |
| 4 | TCT Strategies & Indicators | `/strategies` |
| 5 | Famous Strategies | `/#famous-strategies` (homepage section) |
| 6 | Library | `/library` |
| 7 | Post | `/post` |
| 8 | Articles | `/articles` |
| 9 | Login | `/login` |
| 10 | Connect with us to Get Algo Access | `/get-access` (primary button) |
| 11 | Help | `/help` |

On desktop all eleven items render inline across the top bar in the original header styling
(logo left, links right, 72px bar). Because eleven items are wider than the 1160px container at
narrower desktop widths, `.links` is allowed to wrap onto a second row — order is preserved and
nothing is hidden.

Only below 850px (the original mobile breakpoint) do the inline links give way to a hamburger
drawer, which carries the same eleven items in the same order including the call-to-action
button. The drawer closes on route change, on link click, and on Esc, and locks background
scroll while open.

## Current scope

- Home, Android Journal landing page, TCT Algo, TCT Strategies, Liquidity Strategy,
  Liquidity Algo waitlist
- Articles, Trading Library, Post (empty state), Help, FAQ, Contact
- Login/Register mock UI
- MT5 algo-access mock workflow
- User dashboard and Admin prototype

All pages are still static mock UI — no real requests are made yet. The Post page deliberately
ships with an empty state rather than sample posts.

## Architecture decision

The TCT Trading Journal is Android-only. Journal trades are stored locally on the user's Android
device. The website does not store journal trades. Production Android app should use Room/SQLite
and support export + import/restore.

## Production work still required

- TypeScript types are in place, but there is still no real auth, database, or API layer —
  `login`, `register`, `get-access`, `dashboard`, and `admin` all render static content.
- Authentication, PostgreSQL, email verification, MT5/IB verification integration, EA licensing
  API, admin authorization/2FA, CMS persistence, rate limiting, audit logs.
- Missing routes not yet built: `/dashboard/mt5`, `/dashboard/licenses`, `/articles/[slug]`,
  and the legal pages (`/privacy`, `/terms`, `/risk-disclosure`, `/disclaimer`).
- Legal copy, deployment configuration, and the Play Store URL.
- `/post` has no CMS/database behind it, so no posts can be created, stored or listed.
- Verified contact details and social links live in one place: `lib/contact.ts`. The footer,
  contact page and help page all read from it, so updating a number or handle is a one-file
  change. Social URLs are never printed as text — each logo in `components/SocialLinks.tsx`
  is the link, opening in a new tab.
- The contact form still has no backend, so the phone/WhatsApp/email details are the only
  working channels.
