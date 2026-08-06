import { getBusinessBySlug } from '../../../lib/api';
import BusinessPageClient from '../BusinessPageClient';
import BusinessHero from '../../../components/BusinessHero';
import BusinessOverview from '../../../components/BusinessOverview';
import BusinessSidebar from '../../../components/BusinessSidebar';
import UserSubmissionActions from '../../../components/UserSubmissionActions';
import BusinessFullReviews from '../../../components/BusinessFullReviews';
import BusinessMenu from '../../../components/BusinessMenu';
export async function generateMetadata(props) {
  const params = await props.params;
  const { slug, tab } = params;
  const activeTab = tab ? tab[0] : 'overview';

  try {
    const biz = await getBusinessBySlug(params.slug, {}, true);
    
    if (!biz) throw new Error('Business not found');

    const seo = biz.seo || {};
    let seoTitle = seo.title || `${biz.name} | Nearmee`;
    
    // Customize title based on tab
    if (activeTab === 'reviews') seoTitle = seo.reviews_title || `${biz.name} Reviews | Nearmee`;
    else if (activeTab === 'menu') seoTitle = seo.menu_title || `${biz.name} Menu | Nearmee`;

    const description = seo.description || biz.description || `View reviews and menus for ${biz.name} on Nearmee.`;
    const canonical = seo.canonical || `https://${params.slug}.nearmee.net${activeTab !== 'overview' ? `/${activeTab}` : ''}`;
    const robots = seo.robots || { index: true, follow: true };

    return {
      title: seoTitle,
      description,
      alternates: {
        canonical,
      },
      robots,
    };
  } catch (e) {
    console.error('generateMetadata failed:', e.message);
    return {
      title: 'Business | Nearmee',
      description: 'Find local businesses on Nearmee.',
      robots: { index: false, follow: false },
    };
  }
}

export default async function BusinessTabbedPage(props) {
  const params = await props.params;
  const { slug, tab } = params;
  const business = await getBusinessBySlug(slug).catch(() => null);

  // tab is an array like ['photos'] or undefined
  const activeTabPath = tab ? tab[0] : 'overview';

  // Normalize active tab for rendering logic
  const PATH_TO_TAB = {
    'overview': 'Overview',
    'reviews': 'Reviews',
    'menu': 'Menu',
  };
  const activeTab = PATH_TO_TAB[activeTabPath.toLowerCase()] || 'Overview';
  const isFullPageTab = ['Reviews', 'Menu'].includes(activeTab);

  // Every prop passed to a client component is serialized into the page HTML
  // (Next.js RSC flight data). Passing the whole business object would embed
  // about-us, all reviews, etc. into EVERY tab's source — content that tab
  // doesn't render, which muddies each page's identity for search engines.
  // So hand each tab only the fields it actually displays.
  const shellBusiness = business ? { slug: business.slug, name: business.name } : null;

  const menuBusiness = business ? {
    id: business.id,
    name: business.name,
    address: business.address,
    phone: business.phone,
    type: business.type,
    categories: business.categories,
    menuImages: business.menuImages,
    menuItems: business.menuItems,
    mustTryDishes: business.mustTryDishes,
    updatedAt: business.updatedAt,
    // Descriptive copy is only shown as a fallback when there is no menu, so
    // resolve it here and leave it empty when real menu items exist — that
    // keeps about-us text out of the menu page source in the common case.
    menuAbout: (business.menuItems && business.menuItems.length)
      ? ''
      : (business.menuAbout || business.about || business.description || ''),
  } : null;

  const reviewsBusiness = business ? {
    id: business.id,
    name: business.name,
    address: business.address,
    type: business.type,
    categories: business.categories,
    reviews: business.reviews,
    updatedAt: business.updatedAt,
  } : null;

  let content = null;
  if (activeTab === 'Reviews') {
    content = <BusinessFullReviews business={reviewsBusiness} />;
  } else if (activeTab === 'Menu') {
    content = <BusinessMenu business={menuBusiness} />;
  } else {
    // Overview
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
      {business?.schema && (
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
