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
    title: page.meta_title || `${page.hero_heading} | Nearmee`,
    description: page.meta_description,
    alternates: {
      canonical: 'https://www.nearmee.net/about',
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
            {page.hero_eyebrow && <span className="eyebrow">{page.hero_eyebrow}</span>}
            <h1>{page.hero_heading}</h1>
            {page.hero_lead && <p className="page-hero-lead">{page.hero_lead}</p>}
          </div>
        </section>

        <PageSections sections={page.sections} />

        <CTA />
      </main>
      <Footer />
    </>
  );
}
