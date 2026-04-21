import { Suspense } from 'react';
import { getRestaurantCategories, getTopBusinessesByCategory } from './lib/api';
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import Businesses from './components/Businesses';
import CTA from './components/CTA';
import Footer from './components/Footer';
import { BusinessCardSkeleton } from './components/Skeleton';
import { HexagonOverlay } from './components/HexagonLoader';

export default async function Home() {
  const catData = await getRestaurantCategories().catch(() => ({ results: [] }));
  const initialCategories = (catData.results || []).filter(cat => cat.is_active !== false);

  const bizData = await getTopBusinessesByCategory().catch(() => []);
  const initialBusinesses = bizData || [];

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Categories initialCategories={initialCategories} />
        <Suspense fallback={
          <>
            <div className="container" style={{ padding: '64px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[...Array(3)].map((_, i) => (
                  <BusinessCardSkeleton key={i} />
                ))}
              </div>
            </div>
            <HexagonOverlay label="Loading Top Businesses…" />
          </>
        }>
          <Businesses initialCategorizedBusinesses={initialBusinesses} />
        </Suspense>
        <CTA />
      </main>
      <Footer />
    </>
  );
}
