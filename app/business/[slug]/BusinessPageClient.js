'use client';

import { useState } from 'react';
import BusinessHero from '../../components/BusinessHero';
import BusinessOverview from '../../components/BusinessOverview';
import BusinessSidebar from '../../components/BusinessSidebar';
import BusinessTabs from '../../components/BusinessTabs';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import UserSubmissionActions from '../../components/UserSubmissionActions';
import { getBusinessBySlug } from '../../lib/api';
import { BusinessDetailSkeleton } from '../../components/Skeleton';

export default function BusinessPageClient({ slug, initialBusiness }) {
  const [business, setBusiness] = useState(initialBusiness);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(false);

  // Fetch logic moved to Server Component

  if (loading) return <BusinessDetailSkeleton />;
  if (!business) return <div className="error" style={{ padding: '100px', textAlign: 'center' }}>Business not found</div>;

  return (
    <div className="business-view-page">
      <Header />
      <BusinessHero business={business} />
      <BusinessTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="business-main">
        <div className="container">
          <div className="business-layout">
            <div className="business-content">
              {activeTab === 'Overview' && (
                <>
                  <BusinessOverview business={business} />
                  <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #e2e8f0' }}>
                    <UserSubmissionActions business={business} />
                  </div>
                </>
              )}
              {activeTab !== 'Overview' && (
                <div className="tab-placeholder">
                  <h2>{activeTab} Content Coming Soon</h2>
                </div>
              )}
            </div>
            <BusinessSidebar business={business} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
