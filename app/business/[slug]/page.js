'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import BusinessHero from '../../components/BusinessHero';
import BusinessOverview from '../../components/BusinessOverview';
import BusinessSidebar from '../../components/BusinessSidebar';
import BusinessTabs from '../../components/BusinessTabs';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import UserSubmissionActions from '../../components/UserSubmissionActions';
import { getBusinessBySlug } from '../../lib/api';

export default function BusinessPage() {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      console.log('Fetching business for slug:', slug);
      getBusinessBySlug(slug)
        .then(data => {
          setBusiness(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching business:', err);
          setLoading(false);
        });
    }
  }, [slug]);

  if (loading) return <div className="loading" style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>;
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
