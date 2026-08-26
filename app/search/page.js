import { getBusinesses } from '../lib/api';
import SearchPageClient from './SearchPageClient';
import Footer from '../components/Footer';

export async function generateMetadata(props) {
  const params = await props.searchParams;
  const q = params?.q?.trim() || '';
  return {
    title: q ? `Search results for "${q}" — DoersMarketing` : 'Search Businesses — DoersMarketing',
    description: q ? `Find businesses matching "${q}" on DoersMarketing.` : 'Search local businesses on DoersMarketing.',
  };
}

export default async function SearchPage(props) {
  const params = await props.searchParams;
  const q = params?.q?.trim() || '';

  let initialBusinesses = [];
  let initialTotalPages = 1;
  let initialCount = 0;

  if (q) {
    try {
      const data = await getBusinesses({ search: q, page_size: 20 });
      initialBusinesses = data.results || [];
      initialTotalPages = data.total_pages || 1;
      initialCount = data.count || 0;
    } catch (_) {}
  }

  return (
    <>
      <SearchPageClient
        initialQuery={q}
        initialBusinesses={initialBusinesses}
        initialTotalPages={initialTotalPages}
        initialCount={initialCount}
      />
      <Footer />
    </>
  );
}
