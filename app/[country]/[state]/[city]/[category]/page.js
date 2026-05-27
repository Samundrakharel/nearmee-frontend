import { getCategoryBySlug, getBusinessesByCategorySlug } from '@/app/lib/api';
import CategoryPageClient from '@/app/category/[slug]/CategoryPageClient';
import Footer from '@/app/components/Footer';

export async function generateMetadata(props) {
  const params = await props.params;
  const { country, state, city, category } = params;
  const catData = await getCategoryBySlug(category).catch(() => null);
  const rawTitle = catData?.name || category.split('-').join(' ');
  const formattedTitle = rawTitle.replace(/\b\w/g, c => c.toUpperCase());

  // Formatting location names for metadata title
  const formatLocation = (str) => {
    if (!str) return '';
    return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };
  const locStr = `${formatLocation(city)}, ${formatLocation(state)}`;

  return {
    title: `${formattedTitle} in ${locStr} | Nearmee`,
    description: `Find the best ${formattedTitle.toLowerCase()} in ${locStr} on Nearmee. Read reviews, view menus, and more.`,
    alternates: {
      canonical: `https://www.nearmee.net/${country}/${state}/${city}/${category}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocationCategoryPage(props) {
  const params = await props.params;
  const { country, state, city, category } = params;

  // Fetch initial data on the server, passing location filters to the backend
  const catData = await getCategoryBySlug(category).catch(() => null);

  const bizData = await getBusinessesByCategorySlug(category, {
    page: 1,
    country,
    state,
    city
  }).catch(() => ({
    results: [],
    count: 0,
    total_pages: 1
  }));

  return (
    <>
      <CategoryPageClient
        slug={category}
        country={country}
        state={state}
        city={city}
        initialCategoryInfo={catData}
        initialBusinesses={bizData.results || []}
        initialTotalPages={bizData.total_pages || 1}
      />
      <Footer />
    </>
  );
}
