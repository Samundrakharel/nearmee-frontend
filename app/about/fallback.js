/**
 * Built-in copy for /about, used when the admin-managed page is missing,
 * unpublished, or the API is unreachable.
 *
 * Shaped exactly like the /api/pages/about/ response so the page component does
 * not need to know which source it got. The same content is seeded into the
 * database by core/migrations/0006_seed_site_content.py — edit it there, in the
 * admin; this copy only exists so the page degrades gracefully.
 */
export const ABOUT_FALLBACK = {
  slug: 'about',
  meta_title: 'About Us — Nearmee',
  meta_description:
    'Nearmee is a local business directory built to help people find trusted ' +
    'restaurants, cafes and services in their own city — and to help those ' +
    'businesses get discovered.',
  hero_eyebrow: 'About Nearmee',
  hero_heading: 'Good local businesses, easier to find',
  hero_lead:
    'Nearmee is a local business directory. We collect the details that ' +
    'matter — hours, menus, photos, reviews and directions — so finding ' +
    'somewhere good near you takes a minute instead of an evening.',
  sections: [
    {
      id: 'why',
      layout: 'prose',
      heading: 'Why we built it',
      tinted: false,
      paragraphs: [
        'Finding a decent place to eat in your own city is harder than it should be. The information exists, but it is spread across search results, social posts, out-of-date listings and screenshots of menus. Half of it contradicts the other half, and the opening hours are usually wrong.',
        'Nearmee pulls that together into one place, organised by where you actually are. Pick a category or search a name, and you get the listing with the things you were going to check anyway — what is on the menu, when it opens, what other people thought, and how to get there.',
        'The same directory works in the other direction. A small restaurant or service business can list itself for free, keep its own details accurate, and be found by people who are already looking for what it offers — without paying for ads to do it.',
      ],
      items: [],
    },
    {
      id: 'what',
      layout: 'cards',
      heading: 'What Nearmee does',
      tinted: true,
      paragraphs: [],
      items: [
        {
          id: 'trust',
          heading: 'A directory you can trust',
          body: 'Every listing carries the details that actually decide where you go — opening hours, menus, photos, phone numbers and directions — kept in one place instead of scattered across a dozen tabs.',
        },
        {
          id: 'local',
          heading: 'Built around where you are',
          body: 'Search results are ranked by your city and neighbourhood, not by whoever paid the most. Change your location and the whole directory follows you.',
        },
        {
          id: 'reviews',
          heading: 'Reviews from real visits',
          body: 'Ratings, written reviews and customer photos come from people with an account, so what you read reflects an actual experience rather than an anonymous drive-by.',
        },
        {
          id: 'free',
          heading: 'Free for business owners',
          body: 'Claiming a listing costs nothing. Add your menu, upload photos, correct your hours and reach people who are already searching for what you sell.',
        },
      ],
    },
    {
      id: 'how',
      layout: 'steps',
      heading: 'How it works',
      tinted: false,
      paragraphs: [],
      items: [
        {
          id: 'step1',
          heading: 'Tell us where you are',
          body: 'Share your location or type in a city. Nearmee narrows the directory down to what is genuinely within reach.',
        },
        {
          id: 'step2',
          heading: 'Browse or search',
          body: 'Work through categories like restaurants, cafes and services, or search a name directly if you already know what you want.',
        },
        {
          id: 'step3',
          heading: 'Decide with confidence',
          body: 'Compare ratings, read reviews, check the menu and hours, then call or get directions straight from the listing.',
        },
      ],
    },
    {
      id: 'values',
      layout: 'cards',
      heading: 'What we stand for',
      tinted: true,
      paragraphs: [],
      items: [
        {
          id: 'useful',
          heading: 'Useful before clever',
          body: 'A directory earns its place by answering one question quickly: is this place worth my time? Every feature has to serve that.',
        },
        {
          id: 'honest',
          heading: 'Honest listings',
          body: 'We would rather show a sparse listing than a padded one. Where information is missing, we say so instead of filling the gap with guesses.',
        },
        {
          id: 'localfirst',
          heading: 'Local first',
          body: 'Independent businesses rarely have the budget to compete for attention. A directory that surfaces them fairly is worth building.',
        },
      ],
    },
    {
      id: 'cta',
      layout: 'cta',
      heading: 'Questions, or something we got wrong?',
      tinted: false,
      paragraphs: [
        'If a listing is out of date, a business is missing, or you just want to talk to someone here, we would rather hear it than not.',
      ],
      cta_label: 'Get in touch',
      cta_url: '/contact',
      items: [],
    },
  ],
};
