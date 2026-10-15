import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6';
import { SOCIAL_LINKS } from '@/lib/site-config';

const icons = {
  x: FaXTwitter,
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
  tiktok: FaTiktok,
  youtube: FaYoutube,
  facebook: FaFacebookF,
};

export function SocialLinks() {
  return (
    <nav className="footer-social-icons" aria-label="Print Garage social media">
      {SOCIAL_LINKS.map(({ id, label, href }) => {
        const Icon = icons[id];
        return (
          <a
            className={`footer-social-icon footer-social-icon--${id}`}
            key={id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Print Garage on ${label} (opens in a new tab)`}
            data-testid={`link-social-${id}`}
          >
            <Icon size={20} aria-hidden="true" />
          </a>
        );
      })}
    </nav>
  );
}
