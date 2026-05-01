import { getBusinessBySlug } from '../../lib/api';
import BusinessPageClient from './BusinessPageClient';

export async function generateMetadata(props) {
  const params = await props.params;
  const business = await getBusinessBySlug(params.slug).catch(() => null);

  if (!business) {
    return {
      title: 'Business Not Found | Nearmee',
      description: 'The business you are looking for could not be found.',
      robots: { index: false, follow: false },
    };
  }

  // Use SEO title from backend if available, otherwise fallback to default
  const seoTitle = business.seo?.title || `${business.name} | Nearmee`;
  const description = business.description || `View reviews, menus, and photos for ${business.name} on Nearmee.`;
  console.log('Business Page Metadata:', { seoTitle });
  return {
    title: seoTitle,
    description: description,
    alternates: {
      canonical: `https://www.nearmee.net/business/${params.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function BusinessPage(props) {
  const params = await props.params;
  const { slug } = params;
  const business = await getBusinessBySlug(slug).catch(() => null);

  return <BusinessPageClient slug={slug} initialBusiness={business} />;
}
