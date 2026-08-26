'use client';

import { useEffect, useState } from 'react';
import { useSiteContent } from '../context/SiteContentContext';
import { isBusinessSubdomain, getMainDomainUrl } from '../lib/api';

/**
 * Site footer.
 *
 * Content comes from the Django admin (Core → Site Settings for the blurb and
 * copyright line, Core → Footer Columns for the links), delivered through
 * SiteContentContext so this still works when rendered inside a client
 * component. The constants below are the fallback used when the API is
 * unreachable or nothing has been configured yet, so the footer is never blank.
 */
const FALLBACK_TEXT =
  'Discover the best local marketing, beauty, and service businesses in your area. ' +
  'Find top-rated professionals nearby.';

const FALLBACK_COLUMNS = [
  {
    id: 'company',
    title: 'Company',
    links: [
      { id: 'about', label: 'About Us', url: '/about' },
      { id: 'contact', label: 'Contact Us', url: '/contact' },
      { id: 'list', label: 'List Your Business', url: '/signup?next=/submit-business' },
    ],
  },
  {
    id: 'legal',
    title: 'Legal',
    links: [
      { id: 'privacy', label: 'Privacy Policy', url: '/privacy-policy' },
      { id: 'terms', label: 'Terms of Service', url: '/terms-of-service' },
      // No page yet. Add one under Core → Content Pages with slug
      // "accessibility" and point this at /accessibility — the top-level slug
      // route serves it without any further frontend change.
      { id: 'accessibility', label: 'Accessibility', url: '#' },
    ],
  },
];

// Kept so existing ids like #footer-about survive the move to admin content.
function linkId(label) {
  return `footer-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
}

/**
 * A business subdomain (pizza-hut.doersmarketing.com) serves the same app, but the
 * footer's site-wide destinations (About, Contact, Privacy, …) only exist on
 * the main domain, so a root-relative href would resolve against the business
 * host. Prefix those with the main origin and leave everything else alone:
 * in-page anchors, protocol-relative and absolute URLs, mailto:, tel:.
 */
function toMainDomain(url, origin) {
  if (!origin || !url) return url;
  if (!url.startsWith('/') || url.startsWith('//')) return url;
  return `${origin}${url}`;
}

export default function Footer() {
  const { footer } = useSiteContent();

  // Resolved after mount rather than during render: the hostname is only known
  // client-side, and deferring it keeps the server and first client render
  // identical so hydration doesn't complain. Empty string on the main domain
  // leaves every href relative, exactly as before.
  const [mainDomain, setMainDomain] = useState('');

  useEffect(() => {
    if (isBusinessSubdomain()) {
      setMainDomain(getMainDomainUrl());
    }
  }, []);

  const text = footer?.text || FALLBACK_TEXT;
  const columns = footer?.columns?.length ? footer.columns : FALLBACK_COLUMNS;
  const copyright =
    footer?.copyright || `© ${new Date().getFullYear()} DoersMarketing. All rights reserved.`;

  return (
    <footer className="footer" id="footer" style={{ borderTop: '1px solid var(--color-border)', backgroundColor: '#fff' }}>
      <style>{`
        .footer-col ul a {
          transition: color 0.2s ease;
        }
        .footer-col ul a:hover {
          color: #ff7e67 !important;
        }
      `}</style>
      <div className="footer-inner">
        <div className="footer-brand">
          <a href={toMainDomain('/', mainDomain)} className="logo">
            <svg width="220" height="30" viewBox="0 0 240 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="28" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="24" fill="#18181b" style={{ letterSpacing: '-1px' }}>doers</text>
              <text x="72" y="28" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="24" fill="#ff7e67" style={{ letterSpacing: '-0.5px' }}>marketing</text>
              <circle cx="204" cy="24" r="4" fill="#ff7e67" />
            </svg>
          </a>
          <p style={{ color: 'var(--color-text-medium)', lineHeight: '1.6', maxWidth: '300px' }}>
            {text}
          </p>
        </div>

        {columns.map((column) => (
          <div className="footer-col" key={column.id ?? column.title}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>{column.title}</h4>
            <ul>
              {(column.links || []).map((link) => (
                <li key={link.id ?? link.url}>
                  <a
                    href={toMainDomain(link.url, mainDomain)}
                    id={linkId(link.label)}
                    {...(link.open_in_new_tab
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    style={{ color: 'var(--color-text-medium)', fontSize: '0.95rem' }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="footer-bottom" style={{ borderTop: '1px solid var(--color-border)', padding: '24px 0', textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
        {copyright}
      </div>
    </footer>
  );
}
