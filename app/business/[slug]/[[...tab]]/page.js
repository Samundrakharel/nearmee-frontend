import { getBusinessBySlug } from '../../../lib/api';
import BusinessPageClient from '../BusinessPageClient';
import BusinessHero from '../../../components/BusinessHero';
import BusinessOverview from '../../../components/BusinessOverview';
import BusinessSidebar from '../../../components/BusinessSidebar';
import UserSubmissionActions from '../../../components/UserSubmissionActions';
import BusinessFullReviews from '../../../components/BusinessFullReviews';
import BusinessMenu from '../../../components/BusinessMenu';
import BusinessPhotos from '../../../components/BusinessPhotos';
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
    else if (activeTab === 'photos') seoTitle = seo.services_title || `${biz.name} Photos | Nearmee`;

    const description = seo.description || biz.description || `View reviews, menus, and photos for ${biz.name} on Nearmee.`;
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
    'photos': 'Photos',
  };
  const activeTab = PATH_TO_TAB[activeTabPath.toLowerCase()] || 'Overview';
  const isFullPageTab = ['Reviews', 'Menu', 'Photos'].includes(activeTab);

  let content = null;
  if (activeTab === 'Reviews') {
    content = <BusinessFullReviews business={business} />;
  } else if (activeTab === 'Menu') {
    content = <BusinessMenu business={business} />;
  } else if (activeTab === 'Photos') {
    content = (
      <main className="business-main">
        <div className="container">
          <BusinessPhotos business={business} />
        </div>
      </main>
    );
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
        initialBusiness={business} 
        initialTabPath={activeTabPath} 
        heroContent={!isFullPageTab ? <BusinessHero business={business} /> : null}
      >
        {content}
      </BusinessPageClient>
    </>
  );
}
