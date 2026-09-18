import type { LucideIcon } from 'lucide-react';
import { Instagram, MessageCircle, Send, Youtube } from 'lucide-react';

/** Verified TCT contact details. Update here and every page picks it up. */
export const contact = {
  phoneDisplay: '+91 95037 27983',
  tel: 'tel:+919503727983',
  whatsapp: 'https://wa.me/919503727983',
  email: 'Support@thecorporatetrader.com',
  mailto: 'mailto:Support@thecorporatetrader.com',
};

export interface SocialLink {
  name: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Social destinations. Only the logo is rendered — the raw URL is never printed
 * on the page, it sits in the anchor's href and opens in a new tab on click.
 */
export const socials: SocialLink[] = [
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@The_Corporate_Trader_Hannmant',
    icon: Youtube,
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/the.corporate.traderr',
    icon: Instagram,
  },
  {
    name: 'Telegram',
    href: 'https://t.me/+8UhvXLoVjXU3NTFl',
    icon: Send,
  },
  {
    name: 'WhatsApp',
    href: contact.whatsapp,
    icon: MessageCircle,
  },
];
