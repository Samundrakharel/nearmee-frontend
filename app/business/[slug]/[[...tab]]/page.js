import { getBusinessBySlug } from '../../../lib/api';
import BusinessPageClient from '../BusinessPageClient';

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

    const description = biz.description || `View reviews, menus, and photos for ${biz.name} on Nearmee.`;

    return {
      title: seoTitle,
      description,
      alternates: {
        canonical: `https://${params.slug}.nearmee.net${activeTab !== 'overview' ? `/${activeTab}` : ''}`,
      },
      robots: { index: true, follow: true },
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
      />
    </>
  );
}
