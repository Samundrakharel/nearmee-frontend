'use client';

import { useEffect, useState } from 'react';
import BusinessTabs from '../../components/BusinessTabs';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { BusinessDetailSkeleton } from '../../components/Skeleton';

// Full-page tabs that bypass the sidebar layout
const FULL_PAGE_TABS = ['Reviews', 'Menu', 'Photos'];

export default function BusinessPageClient({ slug, initialBusiness, initialTabPath, heroContent, children }) {
  const [business] = useState(initialBusiness);
  const [loading] = useState(false);

  // Map URL path to tab name for highlighting
  const PATH_TO_TAB = {
    'overview': 'Overview',
    'reviews': 'Reviews',
    'menu': 'Menu',
    'photos': 'Photos',
  };

  const activeTab = PATH_TO_TAB[initialTabPath] || 'Overview';
  const isFullPageTab = FULL_PAGE_TABS.includes(activeTab);

  // DEBUG: Log the business data to see SEO structure
  useEffect(() => {
    if (business) {
      console.log('=== BUSINESS DATA ===');
      console.log('Full business object:', business);
      console.log('SEO data:', business.seo);
      console.log('Debug SEO:', business._debug_seo);
      console.log('====================');
    }
  }, [business]);

  if (loading) return <BusinessDetailSkeleton />;
  if (!business) return <div className="error" style={{ padding: '100px', textAlign: 'center' }}>Business not found</div>;

  // Full-page rendering for Reviews / Menu / Photos (no sidebar, no container)
  if (isFullPageTab) {
    return (
      <div className="business-view-page">
        <Header />
        <BusinessTabs activeTab={activeTab} />
        {children}
        <Footer />
      </div>
    );
  }

  // Overview — keeps the two-column sidebar layout
  return (
    <div className="business-view-page">
      <Header />
      {heroContent}
      <BusinessTabs activeTab={activeTab} />
      {children}
      <Footer />
    </div>
  );
}
