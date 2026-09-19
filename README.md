# The Corporate Trader — Next.js website

Read DEPLOYMENT-SETUP.md before deploying this version. It contains the required
Supabase SQL, email settings, server-only environment variable and subscriber setup.

## Deploy
The ZIP contains the project files directly. Extract it and upload those files/folders
to GitHub. The Vercel root is the folder containing package.json. Select Next.js;
leave the output directory on its default. This is NOT a static export:
account and contact API routes require the Vercel Next.js runtime.
Never upload .env.local, private keys, node_modules or .next.

## Local development
Install Node.js 22+, then npm install and npm run dev.
Use npm run build for a production check.
Validation tests (Node 22.6+): node --experimental-strip-types --test tests/validation.test.mjs

## Included
- Existing landing page, enlarged white-bordered hero image, brand-colour social SVGs and market widgets.
- Email-verified registration, single email/mobile login, reset-password flow and session-aware navigation.
- Public community feed with database-enforced premium posting and manual subscription management.
- Private contact-message storage, validation and success dialog after a successful save.

## Still requires setup / not included
- Public SMTP delivery, live database migration and Vercel environment configuration.
- Automated billing verification, MT5 integration, licensing delivery and a secured admin interface.
- The existing admin/get-access/content prototypes are not production management tools.
- Android journal trades remain on the user's Android device.
- Contact messages appear in Supabase; email notifications to support are not implemented.

Package installation was blocked by network restrictions here. Production build and live
end-to-end authentication/subscription/contact checks are required before launch.
