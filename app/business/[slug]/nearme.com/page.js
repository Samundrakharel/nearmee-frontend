import { getBusinessBySlug } from '../../../lib/api';
import BusinessPageClient from './BusinessPageClient';

export async function generateMetadata(props) {
  const params = await props.params;
  const business = await getBusinessBySlug(params.slug).catch(() => null);
  
  if (!business) {
    return {
      title: 'Business Not Found | Nearmee',
      description: 'The business you are looking for could not be found.'
    };
  }

  return {
    title: `${business.name} | Nearmee`,
    description: business.description || `View reviews, menus, and photos for ${business.name} on Nearmee.`
  };
}

export default async function BusinessPage(props) {
  const params = await props.params;
  const { slug } = params;
  const business = await getBusinessBySlug(slug).catch(() => null);
  
  return <BusinessPageClient slug={slug} initialBusiness={business} />;
}
