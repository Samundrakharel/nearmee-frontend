import PageSections from './PageSections';

/**
 * Renders any admin-managed content page (core.models.Page): the hero band
 * followed by its ordered sections.
 *
 * /about and /contact keep their own routes because each adds page-specific
 * furniture — the closing CTA band, the contact form and the reach-us
 * channels. Everything else (privacy policy, terms of service, accessibility,
 * and whatever gets added next) is served generically through
 * app/[country]/page.js using this component, so a new page needs one row in
 * Django admin → Core → Content Pages and no frontend change at all.
 *
 * Add bands to a page with Core → Page Sections. A "cta" section gives you the
 * same call-to-action treatment /about ends on, which is why there is no
 * hardcoded CTA here — a privacy policy should not be advertising anything.
 */
export default function ContentPage({ page }) {
  const isLegal = page.slug === 'terms-of-service' || page.slug === 'privacy-policy';

  // The legal pages' "Last Updated" line always shows today's date, so it is
  // built here at render time (the page revalidates every 30s) instead of read
  // from the stored hero_lead.
  const heroLead = isLegal
      ? `Last Updated: ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC',
        })}`
      : page.hero_lead;

  return (
    <main>
      <section className="page-hero" id={`${page.slug}-hero`}>
        <div className="page-hero-inner">
          {page.hero_eyebrow && <span className="eyebrow">{page.hero_eyebrow}</span>}
          {/* Falls back to the admin title so a page with no hero heading
              still renders one h1 rather than an empty heading. */}
          <h1>{page.hero_heading || page.title}</h1>
          {heroLead && <p className="page-hero-lead">{heroLead}</p>}
        </div>
      </section>

      {/* Legal pages are plain text: no decorative "Our Story" badge per section. */}
      <PageSections sections={page.sections} plain={isLegal} />
    </main>
  );
}
