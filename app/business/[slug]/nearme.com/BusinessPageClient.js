'use client';

import { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import BusinessHero from '../../../components/BusinessHero';
import BusinessTabs from '../../../components/BusinessTabs';
import BusinessOverview from '../../../components/BusinessOverview';
import BusinessSidebar from '../../../components/BusinessSidebar';
import BusinessReviews from '../../../components/BusinessReviews';
import BusinessFullReviews from '../../../components/BusinessFullReviews';
import BusinessMenu from '../../../components/BusinessMenu';
import BusinessMenuPreview from '../../../components/BusinessMenuPreview';
import BusinessPhotos from '../../../components/BusinessPhotos';
import { getBusinessBySlug } from '../../../lib/api';
import { BusinessDetailSkeleton } from '../../../components/Skeleton';

export default function BusinessPageClient({ slug, initialBusiness }) {
  const [business, setBusiness] = useState(initialBusiness);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(false);

  // Fetch logic moved to Server Component

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  if (loading) return <BusinessDetailSkeleton />;
  if (!business) return <div className="error" style={{ padding: '100px', textAlign: 'center' }}>Business not found</div>;

  return (
    <div className="business-view-page">
      <Header />
      {['FullMenu', 'FullReviews'].includes(activeTab) ? (
        activeTab === 'FullMenu' ? (
          <BusinessMenu business={business} setActiveTab={setActiveTab} />
        ) : (
          <BusinessFullReviews business={business} setActiveTab={setActiveTab} />
        )
      ) : (
        <>
          <BusinessHero business={business} />
          <BusinessTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <main className="business-main">
            <div className="container">
              <div className="business-layout">
                <div className="business-content">
                  {activeTab === 'Overview' && <BusinessOverview business={business} setActiveTab={setActiveTab} />}
                  {activeTab === 'Reviews' && <BusinessReviews business={business} setActiveTab={setActiveTab} />}
                  {activeTab === 'Photos' && <BusinessPhotos business={business} />}
                  {activeTab === 'Menu' && <BusinessMenuPreview business={business} setActiveTab={setActiveTab} />}
                  {!['Overview', 'Reviews', 'Photos', 'Menu'].includes(activeTab) && (
                    <div className="tab-placeholder">
                      <h2>{activeTab} Content Coming Soon</h2>
                    </div>
                  )}
                </div>
                <BusinessSidebar business={business} activeTab={activeTab} />
              </div>
            </div>
          </main>
        </>
      )}

      <Footer />
    </div>
  );
}
