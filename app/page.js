import { Suspense } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import Businesses from './components/Businesses';
import CTA from './components/CTA';
import Footer from './components/Footer';
import { LoadingIcon } from './components/LoadingIcon';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Categories />
        <Suspense fallback={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '40px', color: '#64748b' }}>
            <div style={{ color: '#3B82F6' }}><LoadingIcon size={48} /></div>
            <div style={{ marginTop: '16px', fontSize: '1.1rem', fontWeight: '500' }}>Almost there…</div>
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
