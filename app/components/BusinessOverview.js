'use client';
import { useEffect, useState } from 'react';
import { generateAboutUs } from '../lib/api';

export default function BusinessOverview({ business, setActiveTab }) {
  const [aboutUsContent, setAboutUsContent] = useState(business.about || business.description || '');
  const [generatingAboutUs, setGeneratingAboutUs] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const photos = business.photos || [];
  const amenities = business.amenities || [];
  const faqs = business.faqs || [];

  useEffect(() => {
    // Generate about_us if it doesn't exist or is empty
    const generateAbout = async () => {
      if (!business.about && !business.aboutUs && business.slug) {
        setGeneratingAboutUs(true);
        try {
          const response = await generateAboutUs(business.slug);
          if (response && response.about_us) {
            setAboutUsContent(response.about_us);
          }
        } catch (error) {
          console.error('Failed to generate about_us:', error);
        } finally {
          setGeneratingAboutUs(false);
        }
      }
    };

    generateAbout();
  }, [business.slug, business.about, business.aboutUs]);

  return (
    <div className="business-overview">
      <section className="overview-section" id="about">
        <h2>About</h2>
        {generatingAboutUs ? (
          <div className="loading-placeholder" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
            Generating About Us...
          </div>
        ) : (
          <p>{aboutUsContent || 'No description available.'}</p>
        )}
      </section>

      {photos.length > 0 && (
        <section className="overview-section" id="overview-photos">
          <div className="section-header">
            <h2>Photos</h2>
            {setActiveTab && (
              <button onClick={() => setActiveTab('Photos')} className="view-all" style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: '600', cursor: 'pointer' }}>
                View All Photos
              </button>
            )}
          </div>
          <div className="photos-preview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '16px' }}>
            {photos.filter(Boolean).slice(0, 4).map((photo, index) => {
              const photoUrl = typeof photo === 'string' ? photo : photo?.image;
              if (!photoUrl) return null;
              return (
                <div key={index} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', aspectRatio: '1/1', border: '1px solid var(--color-border)' }}>
                  <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {Object.keys(business.extensions || {}).length > 0 && (() => {
        const extensions = business.extensions || {};
        const allKeys = Object.keys(extensions).filter(k => Array.isArray(extensions[k]) && extensions[k].length > 0);
        if (allKeys.length === 0) return null;

        const preferredKeys = ['offerings', 'accessibility', 'atmosphere'];
        const previewKeys = preferredKeys.filter(k => allKeys.includes(k));
        
        // If the business doesn't have any of the preferred keys, just show up to 3 keys as a fallback
        const defaultVisibleKeys = previewKeys.length > 0 ? previewKeys : allKeys.slice(0, 3);
        const keysToShow = showAllAmenities ? allKeys : defaultVisibleKeys;
        const hasMore = allKeys.length > defaultVisibleKeys.length;

        return (
          <section className="overview-section" id="amenities-and-more">
            <h2>Amenities and More</h2>
            <div className="extensions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginTop: '16px' }}>
              {keysToShow.map((key) => (
                <div key={key} className="extension-category">
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h3>
                  <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {extensions[key].map((item, index) => (
                      <li key={index} style={{ color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ color: '#64748b', fontSize: '1.2rem', lineHeight: '1' }}>•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {hasMore && (
              <button
                onClick={() => setShowAllAmenities(!showAllAmenities)}
                className="btn-see-more"
              >
                {showAllAmenities ? 'Show less' : 'See more'}
              </button>
            )}
          </section>
        );
      })()}

      {faqs.length > 0 && (
        <section className="overview-section" id="faq">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <div className="faq-question">
                  {faq.question}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="overview-section" id="top-reviews">
        <div className="section-header">
          <h2>Top Reviews</h2>
          {setActiveTab && (
            <button onClick={() => setActiveTab('Reviews')} className="view-all" style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
              See All Reviews
            </button>
          )}
        </div>
        <div className="reviews-list">
          {(business.topReviews || []).length > 0 ? (
            business.topReviews.map((review, index) => (
              <div key={index} className="review-card">
                <div className="review-header">
                  <div className="user-avatar" style={{ overflow: 'hidden' }}>
                    {review.avatar ? (
                      <img src={review.avatar} alt={review.user} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      (review.user || review.userName || 'A').charAt(0)
                    )}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{review.user || review.userName}</div>
                    <div className="review-date">{review.date}</div>
                  </div>
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`star ${i < review.rating ? '' : 'empty'}`}>★</span>
                    ))}
                  </div>
                </div>
                <p className="review-content">{review.comment}</p>
              </div>
            ))
          ) : (
            (business.reviews?.list || []).slice(0, 3).map((review, index) => (
              <div key={index} className="review-card">
                <div className="review-header">
                  <div className="user-avatar" style={{ overflow: 'hidden' }}>
                    {review.avatar ? (
                      <img src={review.avatar} alt={review.user} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      (review.user || 'A').charAt(0)
                    )}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{review.user}</div>
                    <div className="review-date">{review.date}</div>
                  </div>
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`star ${i < review.rating ? '' : 'empty'}`}>★</span>
                    ))}
                  </div>
                </div>
                <p className="review-content">{review.comment}</p>
              </div>
            ))
          )}
          {(business.topReviews || []).length === 0 && (business.reviews?.list || []).length === 0 && (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '24px' }}>No reviews yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
