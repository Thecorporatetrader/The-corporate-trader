import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/Site';
import { contact } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Privacy Policy – The Corporate Trader',
  description: 'How The Corporate Trader handles Android Trading Journal data, website accounts, contact messages, and privacy requests.',
  alternates: { canonical: 'https://www.thecorporatetrader.com/privacy-policy' },
};

export default function PrivacyPolicyPage() {
  return (
    <main>
      <PageHero kicker="PRIVACY" title="Privacy Policy – The Corporate Trader">
        Last updated: September 27, 2026
      </PageHero>
      <article className="container max-w-3xl pb-16 text-base leading-8 [&_section]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:mt-3 [&_a]:underline [&_a]:underline-offset-4">
        <p>The Corporate Trader respects your privacy and is committed to protecting your information. This policy covers the Android Trading Journal application and The Corporate Trader website, including website pages opened from the application.</p>

        <section aria-labelledby="journal-data">
          <h2 id="journal-data">1. Trading Journal Data</h2>
          <p>The Trading Journal allows you to record trade details, profit and loss, sessions, ratings, notes, and related information. Journal records are stored locally on your device and are not uploaded to our website servers. Website account information is handled separately, as described below.</p>
        </section>

        <section aria-labelledby="website-access">
          <h2 id="website-access">2. Website Access</h2>
          <p>The Home section of the application may open or display our website. Hosting and embedded services may process technical information such as your IP address, browser or device information, and page requests to deliver their services and protect against abuse. Sign-in uses browser storage to maintain your authentication session. Our request protection uses hashed values derived from IP addresses and, for login requests, login identifiers to limit repeated attempts.</p>
        </section>

        <section aria-labelledby="account-information">
          <h2 id="account-information">3. Account, Contact, and Community Information</h2>
          <p>When you register or complete your profile, we process your name, email address, country calling code, and mobile number for account functionality. Email and password authentication is handled by Supabase. If you choose Google Sign-In, Google and Supabase process authentication information, and we may receive your name, email address, and profile information.</p>
          <p>Account profiles and subscription status are stored remotely in Supabase to provide sign-in, account access, and premium community permissions. Contact forms send your name, email address, calling code, mobile number, and message to our Supabase database so we can handle your request.</p>
          <p>Community posts, replies, ratings, display names, and posting dates are stored remotely and are publicly visible. Do not include private trading records or other sensitive information in public posts.</p>
        </section>

        <section aria-labelledby="journal-privacy">
          <h2 id="journal-privacy">4. Information We Do Not Collect Through the Journal</h2>
          <p>We do not sell your trading journal data. Using the local journal does not give us access to records on your device. If you choose to include journal information in a support message or public community post, that information is processed as part of that message or post.</p>
        </section>

        <section aria-labelledby="third-parties">
          <h2 id="third-parties">5. Third-Party Services</h2>
          <p>We use service providers to operate the website and its features. These include <a href="https://supabase.com/privacy">Supabase</a> for authentication and database storage, <a href="https://vercel.com/legal/privacy-policy">Vercel</a> for website hosting, <a href="https://policies.google.com/privacy">Google</a> when you choose Google Sign-In, and <a href="https://www.tradingview.com/privacy-policy/">TradingView</a> for embedded market quotes and charts. Embedded widgets contact their provider when loaded and may use cookies or similar technologies under that provider&apos;s policy.</p>
          <p>When you follow links to social platforms or contact us through services such as WhatsApp, those services handle information under their own privacy policies. Information necessary to provide the relevant feature is processed by these providers.</p>
        </section>

        <section aria-labelledby="security">
          <h2 id="security">6. Data Security</h2>
          <p>We take reasonable measures to protect information handled through our services, including encrypted HTTPS connections and access controls for private account and contact data. No storage or transmission method is completely secure. You are responsible for protecting access to your devices and accounts.</p>
        </section>

        <section aria-labelledby="data-deletion">
          <h2 id="data-deletion">7. Data Retention and Deletion</h2>
          <p>Local journal records remain on your device until you remove them through available delete or reset functions, clear the application&apos;s data, or uninstall the application. Copies you export or back up must be removed separately.</p>
          <p>We retain account, subscription, contact, and community information as needed to provide those services, handle requests, and meet applicable legal or security obligations. Request-limit records older than one day are cleaned up when subsequent request-limit checks run.</p>
          <p>To request deletion of your website account and associated data, email <a href={contact.mailto}>{contact.email}</a> with the subject &ldquo;Account deletion request&rdquo;, or use our <Link href="/contact">contact page</Link>. Include the email address associated with your account and identify any contact messages or community posts you want removed. Do not send your password. We may need to verify account ownership before acting on the request and will explain any information that must be retained and why. Uninstalling the Android application does not delete a website account or information previously submitted online.</p>
        </section>

        <section aria-labelledby="financial-disclaimer">
          <h2 id="financial-disclaimer">8. Financial Disclaimer</h2>
          <p>The Trading Journal is intended for journaling, tracking, educational, and informational purposes. It does not provide brokerage services, hold customer funds, or execute trades on your behalf.</p>
        </section>

        <section aria-labelledby="children">
          <h2 id="children">9. Children&apos;s Privacy</h2>
          <p>The application is not intended for children under the applicable minimum age required to use financial or trading-related services. If you believe a child has provided personal information through our website, contact us so we can review and address it.</p>
        </section>

        <section aria-labelledby="policy-changes">
          <h2 id="policy-changes">10. Changes to This Privacy Policy</h2>
          <p>We may update this policy from time to time. Changes will be published on this page with an updated revision date.</p>
        </section>

        <section aria-labelledby="contact-us">
          <h2 id="contact-us">11. Contact Us</h2>
          <p>For privacy questions or data requests, contact The Corporate Trader at <a href={contact.mailto}>{contact.email}</a> or through our <Link href="/contact">support contact page</Link>.</p>
        </section>
      </article>
    </main>
  );
}
