'use client';

import { useState, useEffect } from 'react';
import BusinessHero from '../../components/BusinessHero';
import BusinessOverview from '../../components/BusinessOverview';
import BusinessSidebar from '../../components/BusinessSidebar';
import BusinessTabs from '../../components/BusinessTabs';
import BusinessReviews from '../../components/BusinessReviews';
import BusinessFullReviews from '../../components/BusinessFullReviews';
import BusinessMenu from '../../components/BusinessMenu';
import BusinessMenuPreview from '../../components/BusinessMenuPreview';
import BusinessPhotos from '../../components/BusinessPhotos';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import UserSubmissionActions from '../../components/UserSubmissionActions';
import { BusinessDetailSkeleton } from '../../components/Skeleton';

// Map URL hashes → tab names
const HASH_TO_TAB = {
  '#overview': 'Overview',
  '#reviews': 'Reviews',
  '#menu': 'Menu',
  '#photos': 'Photos',
};
const TAB_TO_HASH = {
  'Overview': '#overview',
  'Reviews': '#reviews',
  'Menu': '#menu',
  'Photos': '#photos',
};
// Full-page tabs that bypass the sidebar layout
const FULL_PAGE_TABS = ['Reviews', 'Menu', 'Photos'];

export default function BusinessPageClient({ slug, initialBusiness }) {
  const [business] = useState(initialBusiness);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading] = useState(false);

  // On mount: read hash from URL to set the initial active tab
  useEffect(() => {
    const hash = window.location.hash.toLowerCase();
    const tab = HASH_TO_TAB[hash];
    if (tab) setActiveTab(tab);
  }, []);

  // When tab changes: update URL hash without scrolling
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const hash = TAB_TO_HASH[tab] || '#overview';
    window.history.pushState(null, '', hash);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <BusinessDetailSkeleton />;
  if (!business) return <div className="error" style={{ padding: '100px', textAlign: 'center' }}>Business not found</div>;

  // Full-page rendering for Reviews / Menu / Photos (no sidebar, no container)
  if (FULL_PAGE_TABS.includes(activeTab)) {
    return (
      <div className="business-view-page">
        <Header />
        {/* Hero is hidden here to provide a clean full-page view */}
        <BusinessTabs activeTab={activeTab} setActiveTab={handleTabChange} />
        {activeTab === 'Reviews' && <BusinessFullReviews business={business} setActiveTab={handleTabChange} />}
        {activeTab === 'Menu' && <BusinessMenu business={business} setActiveTab={handleTabChange} />}
        {activeTab === 'Photos' && (
          <main className="business-main">
            <div className="container">
              <BusinessPhotos business={business} />
            </div>
          </main>
        )}
        <Footer />
      </div>
    );
  }

  // Overview — keeps the two-column sidebar layout
  return (
    <div className="business-view-page">
      <Header />
      <BusinessHero business={business} />
      <BusinessTabs activeTab={activeTab} setActiveTab={handleTabChange} />

      <main className="business-main">
        <div className="container">
          <div className="business-layout">
            <div className="business-content">
              <BusinessOverview business={business} />
              <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #e2e8f0' }}>
                <UserSubmissionActions business={business} />
              </div>
            </div>
            <BusinessSidebar business={business} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
