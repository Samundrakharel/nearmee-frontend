import { Suspense } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import Businesses from './components/Businesses';
import CTA from './components/CTA';
import Footer from './components/Footer';
import { BusinessCardSkeleton } from './components/Skeleton';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Categories />
        <Suspense fallback={
          <div className="container" style={{ padding: '64px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[...Array(3)].map((_, i) => (
                <BusinessCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }>
          <Businesses />
        </Suspense>
        <CTA />
      </main>
      <Footer />
    </>
  );
}
