import { Mail, MessageCircle, Phone } from 'lucide-react';
import { PageHero } from '@/components/Site';
import { SocialLinks } from '@/components/SocialLinks';
import { ContactForm } from '@/components/ContactForm';
import { contact } from '@/lib/contact';

export default function Page() {
  return (
    <main>
      <PageHero kicker="CONTACT" title="Talk to TCT">
        Questions about the journal, education or algo access? Send a message — please include
        both your email and mobile number so we can reach you either way.
      </PageHero>
      <section className="container">
        <div className="twocol">
          <ContactForm />
          <div className="card">
            <div className="eyebrow">REACH US DIRECTLY</div>
            <h2>Contact details</h2>
            <div className="contactrows">
              <a href={contact.tel}>
                <Phone size={17} aria-hidden="true" />
                {contact.phoneDisplay}
              </a>
              <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={17} aria-hidden="true" />
                WhatsApp — {contact.phoneDisplay}
              </a>
              <a href={contact.mailto}>
                <Mail size={17} aria-hidden="true" />
                {contact.email}
              </a>
            </div>
            <p style={{ marginTop: 20 }}>Follow TCT:</p>
            <SocialLinks />
            <p className="footnote">
              Please use the phone, WhatsApp or email details for anything time-sensitive.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
