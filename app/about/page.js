import Header from '../components/Header';
import Footer from '../components/Footer';
import CTA from '../components/CTA';
import PageSections from '../components/PageSections';
import { getPageContent } from '../lib/api';
import { ABOUT_FALLBACK } from './fallback';

const SLUG = 'about';

/**
 * Content is managed in the Django admin under Core → Content Pages (slug
 * "about"), with Core → Page Sections for the bands down the page.
 *
 * ABOUT_FALLBACK is used when the page is missing, unpublished, or the API is
 * unreachable, so /about is never blank.
 */
async function loadPage() {
  const page = await getPageContent(SLUG).catch(() => null);
  return page || ABOUT_FALLBACK;
}

export async function generateMetadata() {
  const page = await loadPage();

  return {
    title: page.meta_title || `${page.hero_heading} | DoersMarketing`,
    description: page.meta_description,
    alternates: {
      canonical: 'https://www.doersmarketing.com/about',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function AboutPage() {
  const page = await loadPage();

  return (
    <>
      <Header />
      <main>
        <section className="page-hero" id="about-hero">
          <div className="page-hero-inner">
            {page.hero_eyebrow && (
              <span className="eyebrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                {page.hero_eyebrow}
              </span>
            )}
            <h1>{page.hero_heading}</h1>
            {page.hero_lead && <p className="page-hero-lead">{page.hero_lead}</p>}
          </div>
        </section>

        {/* Highlights / Stats strip */}
        <div className="about-stats-strip">
          <div className="about-stat-card">
            <div className="about-stat-number">50k+</div>
            <div className="about-stat-label">Local Businesses</div>
          </div>
          <div className="about-stat-card">
            <div className="about-stat-number">120+</div>
            <div className="about-stat-label">Cities Covered</div>
          </div>
          <div className="about-stat-card">
            <div className="about-stat-number">100%</div>
            <div className="about-stat-label">Free For Owners</div>
          </div>
          <div className="about-stat-card">
            <div className="about-stat-number">4.8 / 5</div>
            <div className="about-stat-label">Community Rating</div>
          </div>
        </div>

        <PageSections sections={page.sections} />

        <CTA />
      </main>
      <Footer />
    </>
  );
}
