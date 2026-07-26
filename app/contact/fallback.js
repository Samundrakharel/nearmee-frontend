/**
 * Built-in copy for /contact, used when the admin-managed page is missing,
 * unpublished, or the API is unreachable.
 *
 * Shaped like the /api/pages/contact/ response. The same content is seeded into
 * the database by core/migrations/0006_seed_site_content.py — edit it in the
 * admin (Core → Content Pages and Core → Contact Channels); this exists only so
 * the page degrades gracefully.
 */
export const CONTACT_FALLBACK = {
  slug: 'contact',
  meta_title: 'Contact Us — Nearmee',
  meta_description:
    'Get in touch with the Nearmee team. Report an out-of-date listing, ask ' +
    'about listing your business, or send us feedback.',
  hero_eyebrow: 'Contact Us',
  hero_heading: 'We would like to hear from you',
  hero_lead:
    'Whether a listing needs correcting, you want your business on Nearmee, ' +
    'or something on the site is not working — send it over and a person ' +
    'will read it.',
  sections: [],
  channels: [
    {
      id: 'general',
      heading: 'General enquiries',
      icon: 'mail',
      body: 'We aim to reply within two working days.',
      link_label: 'hello@nearmee.net',
      link_url: 'mailto:hello@nearmee.net',
    },
    {
      id: 'listings',
      heading: 'Listings and corrections',
      icon: 'store',
      body: 'Wrong hours, a closed business, or a listing you want removed.',
      link_label: 'support@nearmee.net',
      link_url: 'mailto:support@nearmee.net',
    },
    {
      id: 'hours',
      heading: 'When we are around',
      icon: 'clock',
      body: 'Sunday to Friday, 10:00 – 18:00 (NPT)',
      link_label: '',
      link_url: '',
    },
  ],
};
