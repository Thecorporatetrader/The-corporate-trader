import { Mail, MessageCircle, Phone } from 'lucide-react';
import { PageHero } from '@/components/Site';
import { SocialLinks } from '@/components/SocialLinks';
import { PhoneField } from '@/components/PhoneField';
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
          <div className="card">
            <h2>Contact</h2>
            <label className="fieldlabel">Name</label>
            <input className="input" placeholder="Name" required />
            <label className="fieldlabel">Email</label>
            <input className="input" type="email" placeholder="Email" required />
            <PhoneField label="Mobile number" />
            <label className="fieldlabel">Message</label>
            <textarea className="input" rows={6} placeholder="Message" required />
            <button className="btn primary">Send message</button>
          </div>
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
              The message form above is not connected to a backend yet — please use the phone,
              WhatsApp or email details for anything time-sensitive.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
