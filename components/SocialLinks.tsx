import { socials } from '@/lib/contact';
import Image from 'next/image';

/**
 * Renders the social logos as icon-only links.
 * The destination URLs are never shown as text — each logo is the clickable link.
 */
export function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <div className={`sociallinks ${className}`.trim()}>
      {socials.map(({ name, href }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={name}
          title={name}
          className="socialicon"
        >
          <Image
            src={`/images/social-${name.toLowerCase()}.svg`}
            width={26}
            height={26}
            alt=""
            aria-hidden="true"
            unoptimized
          />
        </a>
      ))}
    </div>
  );
}
