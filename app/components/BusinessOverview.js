'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function BusinessOverview({ business }) {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname
    .replace(/\/(menu|reviews|photos)\/?$/, '')
    .replace(/\/$/, '') || '';
  const aboutUsContent = business.aboutUs || business.about || business.description || '';
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const amenities = business.amenities || [];
  const faqs = business.faqs || [];

  // Resolved server-side by ensureReviewsSummary before this renders, so there
  // is no client-side generation call to make here.
  const reviewsSummary = business.reviewsSummary || '';
  const avgRating = business.reviews?.summary?.average || business.rating || 0;
  const totalReviews = business.reviews?.summary?.total || business.reviewCount || 0;
  const hasReviews = (business.reviews?.list || []).length > 0 || totalReviews > 0;
  const topReviews = (business.topReviews?.length ? business.topReviews : business.reviews?.list || []).slice(0, 4);

  // No about_us generation here. This effect used to fire a live LLM call from
  // the browser whenever the copy was empty — which, with tens of thousands of
  // listings still ungenerated, meant one billable call per Overview view (and
  // Googlebot runs JS, so crawlers triggered it too). Backfill deliberately
  // instead: `python manage.py generate_about_us`.

  return (
    <div className="business-overview" style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      <section className="overview-section" id="about">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '16px', color: '#0f172a' }}>About - {business.name}</h2>
        <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: '#475569', margin: 0 }}>{aboutUsContent || 'No description available.'}</p>
      </section>

      {(() => {
        const menuItems = business.menuItems || business.menus || [
          { name: 'Signature Double Burger', price: '$8.99', description: 'Two 100% pure beef patties, hand-leafed lettuce, tomato, spread, with or without cheese.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80' },
          { name: 'Classic Fries', price: '$3.49', description: 'Fresh cut potatoes prepared in 100% cholesterol-free oil.', image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&q=80' },
          { name: 'Strawberry Shake', price: '$4.29', description: 'A delicious creamy strawberry shake.', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80' },
          { name: 'Grilled Cheese', price: '$4.99', description: 'Two slices of melted American cheese, hand-leafed lettuce, tomato, spread.', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80' }
        ];

        return (
          <section className="overview-section" id="popular-menu">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Popular Menu Items</h2>
            </div>
            <div className="menu-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
              {menuItems.slice(0, 4).map((item, idx) => (
                <div key={idx} className="menu-item-card glass" style={{ display: 'flex', gap: '16px', padding: '16px', borderRadius: '16px', border: '1px solid var(--color-border)', cursor: 'pointer', transition: 'all 0.2s', minWidth: 0 }} onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-light)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: '#f1f5f9' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px', gap: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', lineHeight: '1.2', minWidth: 0, overflowWrap: 'anywhere' }}>{item.name}</h4>
                        <span style={{ fontWeight: '700', color: '#059669', fontSize: '1.05rem' }}>{item.price}</span>
                      </div>
                      {item.description && <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
              <a href={`${basePath}/menu`} className="btn-see-more" style={{ textDecoration: 'none' }}>
                See Full Menu
              </a>
          </section>
        );
      })()}

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
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '24px', color: '#0f172a' }}>Amenities and More</h2>
            <div className="extensions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '32px' }}>
              {keysToShow.map((key) => (
                <div key={key} className="extension-category glass" style={{ border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }}></span>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h3>
                  <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {extensions[key].map((item, index) => (
                      <li key={index} style={{ color: '#475569', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
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
                className="view-all"
                style={{ marginTop: '24px', background: 'rgba(59, 130, 246, 0.1)', border: 'none', color: 'var(--color-primary)', fontWeight: '700', cursor: 'pointer', padding: '10px 20px', borderRadius: '12px', fontSize: '0.95rem' }}
              >
                {showAllAmenities ? 'Show less' : 'See all amenities'}
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
            <a href={`${basePath}/reviews`} className="view-all" style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}>
              See All Reviews
            </a>
        </div>
        {reviewsSummary ? (
          <div className="reviews-summary">
            <div className="reviews-summary-stats">
              <span className="reviews-summary-score">{avgRating.toFixed(1)}</span>
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`star ${i < Math.round(avgRating) ? '' : 'empty'}`}>★</span>
                ))}
              </div>
              {totalReviews > 0 && (
                <span className="reviews-summary-count">
                  {totalReviews.toLocaleString()} review{totalReviews === 1 ? '' : 's'}
                </span>
              )}
            </div>
            <p className="reviews-summary-text">{reviewsSummary}</p>
            <p className="reviews-summary-note">Summarised from customer reviews</p>
          </div>
        ) : (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '24px' }}>
            {hasReviews ? 'Review summary coming soon.' : 'No reviews yet.'}
          </p>
        )}
        {topReviews.length > 0 && (
          <div className="reviews-list">
            {topReviews.map((review, index) => (
              <div key={index} className="review-card">
                <div className="review-header">
                  <div className="user-avatar">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="user-info">
                    <div className="user-name">{review.user}</div>
                    <div className="review-date">{review.date}</div>
                  </div>
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`star ${i < Math.round(review.rating || 0) ? '' : 'empty'}`}>★</span>
                    ))}
                  </div>
                </div>
                <p className="review-content">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
          <a href={`${basePath}/reviews`} className="btn-see-more" style={{ textDecoration: 'none' }}>
            See Full Reviews
          </a>
      </section>
    </div>
  );
}
