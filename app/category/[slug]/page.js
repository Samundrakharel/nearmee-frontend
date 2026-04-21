import { getCategoryBySlug, getBusinessesByCategorySlug } from '../../lib/api';
import CategoryPageClient from './CategoryPageClient';
import Footer from '../../components/Footer';

export async function generateMetadata(props) {
  const params = await props.params;
  const catData = await getCategoryBySlug(params.slug).catch(() => null);
  const rawTitle = catData?.name || params.slug.split('-').join(' ');
  const formattedTitle = rawTitle.replace(/\b\w/g, c => c.toUpperCase());
  
  return {
    title: `${formattedTitle} Near You | Nearmee`,
    description: `Find the best ${formattedTitle.toLowerCase()} near you on Nearmee. Read reviews, view menus, and more.`,
    alternates: {
      canonical: `https://www.nearmee.com/category/${params.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CategoryPage(props) {
  const params = await props.params;
  const { slug } = params;

  // Fetch initial data on the server
  const catData = await getCategoryBySlug(slug).catch(() => null);
  
  const bizData = await getBusinessesByCategorySlug(slug, { page: 1 }).catch(() => ({
    results: [],
    count: 0,
    total_pages: 1
  }));

  return (
    <>
      <CategoryPageClient 
        slug={slug}
        initialCategoryInfo={catData}
        initialBusinesses={bizData.results || []}
        initialTotalPages={bizData.total_pages || 1}
      />
      <Footer />
    </>
  );
}
