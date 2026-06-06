'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function BusinessFullReviews({ business }) {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname
    .replace(/\/(menu|reviews|photos)\/?$/, '')
    .replace(/\/$/, '') || '';
  const reviews = business.reviews || { summary: {}, list: [] };
  const { summary = {}, list = [] } = reviews;

  const totalReviews = summary.total || 0;
  const avgRating = summary.average || 0;

  const starPercentages = [5, 4, 3, 2, 1].map(star => {
    const count = summary.counts ? summary.counts[star] : 0;
    return {
      star,
      percentage: totalReviews ? Math.round((count / totalReviews) * 100) : 0,
      count
    };
  });

  function StarRating({ rating, size = '1rem' }) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? 'var(--color-star, #fbbf24)' : '#ddd', fontSize: size }}>★</span>
      );
    }
    return <div style={{ display: 'flex', gap: '2px' }}>{stars}</div>;
  }

  const categories = business.categories || [];

  return (
    <div className="business-reviews-fullpage" style={{ padding: '32px 0', background: '#fff', minHeight: '100vh' }}>
      <div className="container">
        {/* Breadcrumb & Header Area */}
        <div className="menu-header-area" style={{ marginBottom: '32px' }}>
          <div className="breadcrumb" style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '24px' }}>
            <a href={basePath || '/'} style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}>{business.name}</a> &gt; <span style={{ color: '#cf8129', fontWeight: '500' }}>Reviews</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                  {business.name} - Reviews
                </h1>
                <span style={{ fontSize: '1rem', fontWeight: '400', color: '#64748b', whiteSpace: 'nowrap' }}>
                  (updated May 2026)
                </span>
              </div>

              <div style={{ color: '#475569', fontSize: '1.05rem', marginBottom: '8px' }}>
                {categories.length > 0 ? (
                  categories.map((cat, index) => {
                    const catName = typeof cat === 'string' ? cat : cat.name;
                    return (
                      <span key={index}>
                        <span style={{ color: '#475569' }}>{catName}</span>
                        {index < categories.length - 1 && ', '}
                      </span>
                    );
                  })
                ) : business.type ? (
                  <span style={{ color: '#475569' }}>{business.type}</span>
                ) : null}
              </div>

              <a
                href={`${basePath || '/'}#business-map`}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '1.05rem', marginBottom: '8px', textDecoration: 'underline', textDecorationColor: 'transparent', transition: 'all 0.2s', textAlign: 'left' }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = 'var(--color-primary, #0d7377)';
                  e.currentTarget.style.textDecorationColor = 'var(--color-primary, #0d7377)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = '#475569';
                  e.currentTarget.style.textDecorationColor = 'transparent';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{business.address}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

          {/* Left Column: Rating Summary */}
          <div style={{ flex: '0 0 350px', position: 'sticky', top: '24px' }}>
            <div className="rating-summary-card" style={{
              background: '#fff',
              padding: '32px',
              borderRadius: 'var(--radius-md, 12px)',
              border: '1px solid var(--color-border, #e2e8f0)',
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px', color: 'var(--color-text-dark, #0f172a)' }}>Rating Summary</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="rating-overall" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1', marginBottom: '8px' }}>{avgRating || '-'}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                    <StarRating rating={Math.round(avgRating)} size="1.25rem" />
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-medium, #64748b)' }}>{totalReviews} reviews</div>
                </div>

                <div className="rating-bars">
                  {starPercentages.map((item) => (
                    <div key={item.star} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--color-text-medium, #64748b)', width: '45px', flexShrink: 0 }}>{item.star} stars</span>
                      <div style={{
                        flex: 1,
                        height: '8px',
                        background: '#f1f5f9',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${item.percentage}%`,
                          height: '100%',
                          background: '#fbbf24',
                          borderRadius: '4px'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: All Reviews */}
          <div style={{ flex: '1', minWidth: 0 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>All Reviews</h2>
            <div className="reviews-list">
              {list.length > 0 ? list.map((review, index) => (
                <div key={index} className="review-card" style={{
                  background: '#fff',
                  padding: '24px',
                  borderRadius: 'var(--radius-md, 12px)',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#eff6ff',
                        color: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        overflow: 'hidden'
                      }}>
                        {review.avatar ? (
                          <img src={review.avatar} alt={review.user} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          review.initials || (review.user || 'A').substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-text-dark, #0f172a)', margin: 0 }}>{review.user}</h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light, #94a3b8)' }}>{review.date}</span>
                      </div>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  <p style={{ fontSize: '0.95rem', color: 'var(--color-text-medium, #475569)', lineHeight: '1.6', margin: 0 }}>{review.comment}</p>
                </div>
              )) : (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>No reviews yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
