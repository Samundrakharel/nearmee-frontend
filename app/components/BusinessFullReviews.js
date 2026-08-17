'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isLoggedIn, getMyReviews } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function BusinessFullReviews({ business }) {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname
    .replace(/\/(menu|reviews|photos)\/?$/, '')
    .replace(/\/$/, '') || '';

  const { user } = useAuth();
  const [userReviews, setUserReviews] = useState([]);

  const fetchUserReviews = async () => {
    if (!isLoggedIn()) return;
    try {
      const data = await getMyReviews();
      const filtered = (data || [])
        .filter(r => r.business === business.id)
        .map(r => ({
          id: r.id,
          user: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'You',
          initials: ((user?.first_name || user?.username || 'Y').charAt(0)).toUpperCase(),
          avatar: null,
          rating: r.rating || 0,
          comment: r.content || '',
          title: r.title || '',
          date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
          status: r.status,
          photos: r.photos,
        }));
      setUserReviews(filtered);
    } catch (err) {
      console.error('Failed to fetch user reviews:', err);
    }
  };

  useEffect(() => {
    fetchUserReviews();
    window.addEventListener('nearmee-review-added', fetchUserReviews);
    return () => window.removeEventListener('nearmee-review-added', fetchUserReviews);
  }, [business.id, user]);

  const reviews = business.reviews || { summary: {}, list: [] };
  const { summary = {}, list = [] } = reviews;

  // Merge user reviews (pending or approved), de-duplicating by ID
  const mergedList = [...list];
  userReviews.forEach(ur => {
    const exists = list.some(r => r.id === ur.id || (r.comment === ur.comment && r.rating === ur.rating));
    if (!exists) {
      mergedList.unshift(ur);
    }
  });

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

  const updatedLabel = new Date(business.updatedAt || Date.now())
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

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
                <h1 style={{ fontSize: 'clamp(1.5rem, 6vw, 2.5rem)', fontWeight: '800', margin: 0, color: '#0f172a', overflowWrap: 'break-word', wordBreak: 'break-word', minWidth: 0 }}>
                  {business.name} - Reviews
                </h1>
                <span style={{ fontSize: '1rem', fontWeight: '400', color: '#64748b', whiteSpace: 'nowrap' }}>
                  (updated {updatedLabel})
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

        {/* Main Content Area — classes rather than inline styles so the
            columns can stack on narrow screens (inline styles can't be
            overridden by a media query). */}
        <div className="reviews-layout">

          {/* Left Column: Rating Summary */}
          <div className="reviews-summary-col">
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
                      <span style={{ fontSize: '0.9rem', color: 'var(--color-text-medium, #64748b)', width: '52px', flexShrink: 0, whiteSpace: 'nowrap' }}>{item.star} stars</span>
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
          <div className="reviews-list-col">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>All Reviews</h2>
            <div className="reviews-list">
              {mergedList.length > 0 ? mergedList.map((review, index) => (
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
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-text-dark, #0f172a)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {review.user}
                          {review.status && review.status !== 'approved' && (
                            <span style={{
                              padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: '600',
                              background: '#fef3c7', color: '#92400e', display: 'inline-block'
                            }}>
                              Pending Approval
                            </span>
                          )}
                        </h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light, #94a3b8)' }}>{review.date}</span>
                      </div>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  {review.title && <h4 style={{ margin: '0 0 6px 0', fontWeight: '600', fontSize: '0.95rem' }}>{review.title}</h4>}
                  <p style={{ fontSize: '0.95rem', color: 'var(--color-text-medium, #475569)', lineHeight: '1.6', margin: 0, overflowWrap: 'anywhere' }}>{review.comment}</p>
                  {review.photos && review.photos.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                      {review.photos.map(p => (
                        <img key={p.id} src={typeof p === 'string' ? p : p.photo} alt={p.caption || ''}
                          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      ))}
                    </div>
                  )}
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
