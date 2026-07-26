import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ContactForm from '../components/ContactForm';
import PageSections from '../components/PageSections';
import { getPageContent } from '../lib/api';
import { CONTACT_FALLBACK } from './fallback';

const SLUG = 'contact';

/**
 * Content is managed in the Django admin: Core → Content Pages (slug
 * "contact") for the hero and any extra sections, and Core → Contact Channels
 * for the list of ways to reach you beside the form.
 *
 * CONTACT_FALLBACK covers the API being unreachable or the page unpublished.
 */
async function loadPage() {
  const page = await getPageContent(SLUG).catch(() => null);
  return page || CONTACT_FALLBACK;
}

const ICONS = {
  mail: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  ),
  phone: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  ),
  pin: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  store: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l1.5-5h15L21 9" />
      <path d="M4 9h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
      <path d="M9 21v-6h6v6" />
    </svg>
  ),
};

export async function generateMetadata() {
  const page = await loadPage();

  return {
    title: page.meta_title || `${page.hero_heading} | Nearmee`,
    description: page.meta_description,
    alternates: {
      canonical: 'https://www.nearmee.net/contact',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ContactPage() {
  const page = await loadPage();
  const channels = page.channels?.length ? page.channels : CONTACT_FALLBACK.channels;

  // Used by the form's failure message, so it always offers a real address.
  const firstEmail = channels.find(c => c.link_url?.startsWith('mailto:'));
  const fallbackEmail = firstEmail?.link_label || 'hello@nearmee.net';

  return (
    <>
      <Header />
      <main>
        <section className="page-hero" id="contact-hero">
          <div className="page-hero-inner">
            {page.hero_eyebrow && <span className="eyebrow">{page.hero_eyebrow}</span>}
            <h1>{page.hero_heading}</h1>
            {page.hero_lead && <p className="page-hero-lead">{page.hero_lead}</p>}
          </div>
        </section>

        <section className="static-section" id="contact-main">
          <div className="container contact-layout">
            <div className="contact-channels">
              {channels.map((channel) => (
                <div className="contact-channel" key={channel.id}>
                  <div className="contact-channel-icon">{ICONS[channel.icon] || ICONS.mail}</div>
                  <div>
                    <h3>{channel.heading}</h3>
                    <p>
                      {channel.link_url && channel.link_label && (
                        <>
                          <a href={channel.link_url}>{channel.link_label}</a>
                          {channel.body && <br />}
                        </>
                      )}
                      {channel.body}
                    </p>
                  </div>
                </div>
              ))}

              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-medium)', lineHeight: 1.7, margin: 0 }}>
                Want to be listed? You can{' '}
                <Link href="/signup?next=/submit-business" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                  add your business yourself
                </Link>{' '}
                in a few minutes — no need to email us first.
              </p>
            </div>

            <ContactForm fallbackEmail={fallbackEmail} />
          </div>
        </section>

        <PageSections sections={page.sections} />
      </main>
      <Footer />
    </>
  );
}
