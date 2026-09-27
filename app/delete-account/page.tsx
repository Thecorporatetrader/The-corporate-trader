
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/Site';
import { contact } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Delete Account – The Corporate Trader',
  description:
    'Request deletion of your The Corporate Trader account and associated website data.',
  alternates: {
    canonical: 'https://www.thecorporatetrader.com/delete-account',
  },
};

export default function DeleteAccountPage() {
  return (
    <main>
      <PageHero kicker="ACCOUNT" title="Delete Your Account">
        Request deletion of your The Corporate Trader account and associated data.
      </PageHero>

      <article className="container max-w-3xl pb-16 text-base leading-8 [&_section]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:mt-3 [&_a]:underline [&_a]:underline-offset-4">
        <section>
          <h2>How to request account deletion</h2>

          <p>
            To delete your The Corporate Trader account, send an email to{' '}
            <a
              href={`${contact.mailto}?subject=Account%20Deletion%20Request`}
            >
              {contact.email}
            </a>{' '}
            using the email address associated with your account.
          </p>

          <p>
            Use the subject <strong>Account Deletion Request</strong>.
          </p>

          <p>
            You can also submit your request through our{' '}
            <Link href="/contact">contact page</Link>.
          </p>

          <p>
            Please do not send your password. We may ask you to verify account
            ownership before completing the deletion request.
          </p>
        </section>

        <section>
          <h2>What data will be deleted</h2>

          <p>
            After your request is verified, we will delete the account
            information associated with your The Corporate Trader account where
            applicable. This may include your name, email address, mobile
            number, profile information, account profile and related account
            data.
          </p>

          <p>
            Community posts, replies, ratings or support/contact information
            associated with your account can also be reviewed for deletion
            when requested.
          </p>
        </section>

        <section>
          <h2>Trading Journal data</h2>

          <p>
            Trading Journal records are stored locally on your device and are
            not uploaded to The Corporate Trader servers.
          </p>

          <p>
            You can remove local journal data using the delete or reset options
            available in the application, by clearing the application data, or
            by uninstalling the application.
          </p>

          <p>
            Any journal files you have exported or backed up must be deleted
            separately by you.
          </p>
        </section>

        <section>
          <h2>Data that may be retained</h2>

          <p>
            Some information may be retained where reasonably necessary for
            legal, security, fraud-prevention, accounting, or regulatory
            obligations. If information must be retained, we will limit it to
            what is necessary for that purpose.
          </p>
        </section>

        <section>
          <h2>Need help?</h2>

          <p>
            Contact The Corporate Trader at{' '}
            <a href={contact.mailto}>{contact.email}</a> or visit our{' '}
            <Link href="/contact">support page</Link>.
          </p>
        </section>
      </article>
    </main>
  );
}
