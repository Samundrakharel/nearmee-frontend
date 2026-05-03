import { getBusinessBySlug } from '../../lib/api';
import BusinessPageClient from './BusinessPageClient';

export async function generateMetadata(props) {
  const params = await props.params;

  try {
    const biz = await getBusinessBySlug(params.slug, {}, true);
    
    if (!biz) throw new Error('Business not found');

    const seoTitle = biz.seo?.title || `${biz.name} | Nearmee`;
    const description = biz.description || `View reviews, menus, and photos for ${biz.name} on Nearmee.`;

    return {
      title: seoTitle,
      description,
      alternates: {
        canonical: `https://www.nearmee.net/business/${params.slug}`,
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

export default async function BusinessPage(props) {
  const params = await props.params;
  const { slug } = params;
  const business = await getBusinessBySlug(slug).catch(() => null);

  return (
    <>
      {business?.schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(business.schema) }}
        />
      )}
      <BusinessPageClient slug={slug} initialBusiness={business} />
    </>
  );
}
