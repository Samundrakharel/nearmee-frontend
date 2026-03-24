'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import BusinessHero from '../../../components/BusinessHero';
import BusinessTabs from '../../../components/BusinessTabs';
import BusinessOverview from '../../../components/BusinessOverview';
import BusinessSidebar from '../../../components/BusinessSidebar';
import BusinessReviews from '../../../components/BusinessReviews';
import BusinessMenu from '../../../components/BusinessMenu';
import BusinessPhotos from '../../../components/BusinessPhotos';
import { getBusinessBySlug } from '../../../lib/api';

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
      {activeTab === 'Menu' ? (
        <BusinessMenu business={business} setActiveTab={setActiveTab} />
      ) : (
        <>
          <BusinessHero business={business} />
          <BusinessTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <main className="business-main">
            <div className="container">
              <div className="business-layout">
                <div className="business-content">
                  {activeTab === 'Overview' && <BusinessOverview business={business} setActiveTab={setActiveTab} />}
                  {activeTab === 'Reviews' && <BusinessReviews business={business} />}
                  {activeTab === 'Photos' && <BusinessPhotos business={business} />}
                  {!['Overview', 'Reviews', 'Photos'].includes(activeTab) && (
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
