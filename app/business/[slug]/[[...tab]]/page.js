import { notFound } from 'next/navigation';
import { getBusinessBySlug, ensureReviewsSummary, getBusinesses, getRestaurantCategories } from '../../../lib/api';
import BusinessPageClient from '../BusinessPageClient';
import BusinessHero from '../../../components/BusinessHero';
import BusinessOverview from '../../../components/BusinessOverview';
import BusinessSidebar from '../../../components/BusinessSidebar';
import UserSubmissionActions from '../../../components/UserSubmissionActions';
import BusinessFullReviews from '../../../components/BusinessFullReviews';
import BusinessMenu from '../../../components/BusinessMenu';

// Tabs recognized under a business page/subdomain — anything else 404s
// rather than silently rendering the Overview tab under that URL.
const PATH_TO_TAB = {
  'overview': 'Overview',
  'reviews': 'Reviews',
  'menu': 'Menu',
};

// A business subdomain (foo.nearmee.net) rewrites to /business/foo here (see
// proxy.js). A 404 from the API means the slug doesn't exist — surfaced with
// notFound() so it renders the styled app/not-found.js page under a real 404
// status instead of a 200 "not found" div, and so subdomains get the same
// 404 page as the main site.
async function fetchBusiness(slug, queryParams, skipGenerate) {
  try {
    return await getBusinessBySlug(slug, queryParams, skipGenerate);
  } catch (err) {
    if (err?.status === 404) return null;
    throw err;
  }
}

// `tab` is an optional catch-all, so a URL can carry extra junk segments
// (e.g. /menu/foo) or an unrecognized first segment (e.g. /photos) — both
// should 404 rather than silently rendering the Overview tab at that URL.
function resolveTabPath(tab) {
  if (!tab) return 'overview';
  if (tab.length > 1) return null;
  const path = tab[0].toLowerCase();
  return PATH_TO_TAB[path] ? path : null;
}

export async function generateMetadata(props) {
  const params = await props.params;
  const { slug, tab } = params;
  const activeTabPath = resolveTabPath(tab);
  if (!activeTabPath) notFound();

  let biz;
  try {
    biz = await fetchBusiness(params.slug, {}, true);
  } catch (e) {
    console.error('generateMetadata failed:', e.message);
    return {
      title: 'Business | Nearmee',
      description: 'Find local businesses on Nearmee.',
      robots: { index: false, follow: false },
    };
  }

  // Bail out here rather than in the component below. By the time the page
  // body runs, the response status has already been committed as 200, so a
  // notFound() there yields a soft 404 — 404 content served under a 200,
  // which search engines will happily index.
  if (!biz) notFound();

  const seo = biz.seo || {};
  let seoTitle = seo.title || `${biz.name} | Nearmee`;

  // Customize title based on tab
  if (activeTabPath === 'reviews') seoTitle = seo.reviews_title || `${biz.name} Reviews | Nearmee`;
  else if (activeTabPath === 'menu') seoTitle = seo.menu_title || `${biz.name} Menu | Nearmee`;

  const description = seo.description || biz.description || `View reviews and menus for ${biz.name} on Nearmee.`;
  const canonical = seo.canonical || `https://${params.slug}.nearmee.net${activeTabPath !== 'overview' ? `/${activeTabPath}` : ''}`;
  const robots = seo.robots || { index: true, follow: true };

  return {
    title: seoTitle,
    description,
    alternates: {
      canonical,
    },
    robots,
  };
}

export default async function BusinessTabbedPage(props) {
  const params = await props.params;
  const { slug, tab } = params;

  const activeTabPath = resolveTabPath(tab);
  if (!activeTabPath) notFound();

  // skipGenerate: About Us is never generated on render. This page is served
  // to crawlers far more often than to people, and with tens of thousands of
  // listings still ungenerated, one live LLM call per crawled business is
  // unbounded spend driven by whoever happens to be crawling us. Backfill it
  // deliberately instead: `python manage.py generate_about_us`.
  const business = await fetchBusiness(slug, {}, true);
  if (!business) notFound();

  const activeTab = PATH_TO_TAB[activeTabPath];
  const isFullPageTab = ['Reviews', 'Menu'].includes(activeTab);

  // Every prop passed to a client component is serialized into the page HTML
  // (Next.js RSC flight data). Passing the whole business object would embed
  // about-us, all reviews, etc. into EVERY tab's source — content that tab
  // doesn't render, which muddies each page's identity for search engines.
  // So hand each tab only the fields it actually displays.
  const shellBusiness = { slug: business.slug, name: business.name };

  const menuAboutText = business.menuAbout || business.about || business.description || '';

  const menuBusiness = {
    id: business.id,
    slug: business.slug,
    name: business.name,
    address: business.address,
    phone: business.phone,
    type: business.type,
    categories: business.categories,
    menuImages: business.menuImages,
    menuItems: business.menuItems,
    mustTryDishes: business.mustTryDishes,
    menuAbout: menuAboutText,
  };

  const reviewsBusiness = {
    id: business.id,
    name: business.name,
    address: business.address,
    type: business.type,
    categories: business.categories,
    reviews: business.reviews,
  };

  let content = null;
  if (activeTab === 'Reviews') {
    content = <BusinessFullReviews business={reviewsBusiness} />;
  } else if (activeTab === 'Menu') {
    let relatedBusinesses = [];
    let allCategories = [];
    try {
      const [bizesData, catsData] = await Promise.all([
        getBusinesses({ page_size: 6 }).catch(() => ({ results: [] })),
        getRestaurantCategories().catch(() => ({ results: [] })),
      ]);
      const results = bizesData.results || (Array.isArray(bizesData) ? bizesData : []);
      relatedBusinesses = results.filter(b => b.slug !== business.slug).slice(0, 3);
      allCategories = catsData.results || (Array.isArray(catsData) ? catsData : []);
    } catch (e) {
      console.error('Failed to fetch related menu data:', e);
    }

    const countryName = business.country?.name || 'Nepal';
    const locationInfo = {
      country: business.country?.name || '',
      countryCode: business.country?.code || '',
      state: business.state?.name || '',
      stateCode: business.state?.code || '',
      city: business.city?.name || '',
    };

    content = (
      <BusinessMenu
        business={menuBusiness}
        relatedBusinesses={relatedBusinesses}
        allCategories={allCategories}
        countryName={countryName}
        locationInfo={locationInfo}
      />
    );
  } else {
    // Overview — the only tab that renders the reviews summary, so it is also
    // the only one that pays to generate it. Awaiting here puts the summary in
    // the server-rendered HTML, so crawlers see it too.
    await ensureReviewsSummary(business);

    content = (
      <main className="business-main">
        <div className="container">
          <div className="business-layout">
            <div className="business-content">
              <BusinessOverview business={business} />
              <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #e2e8f0' }}>
                <UserSubmissionActions business={business} />
              </div>
            </div>
            <BusinessSidebar business={business} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      {business.schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(business.schema) }}
        />
      )}
      <BusinessPageClient
        slug={slug}
        initialBusiness={shellBusiness}
        initialTabPath={activeTabPath}
        heroContent={!isFullPageTab ? <BusinessHero business={business} /> : null}
      >
        {content}
      </BusinessPageClient>
    </>
  );
}
