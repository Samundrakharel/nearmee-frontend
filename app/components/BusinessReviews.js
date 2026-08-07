'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isLoggedIn, getMyReviews } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function BusinessReviews({ business }) {
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
  const { list = [] } = reviews;

  // Merge user reviews (pending or approved), de-duplicating by ID
  const mergedList = [...list];
  userReviews.forEach(ur => {
    const exists = list.some(r => r.id === ur.id || (r.comment === ur.comment && r.rating === ur.rating));
    if (!exists) {
      mergedList.unshift(ur);
    }
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

  // Display only top 5 reviews
  const topReviews = mergedList.slice(0, 5);

  return (
    <div className="business-reviews-tab" style={{ width: '100%' }}>
      
      {/* Reviews List */}
      <div className="reviews-list">
        {topReviews.length > 0 ? (
          <>
            {topReviews.map((review, index) => (
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
                 <p style={{ fontSize: '0.95rem', color: 'var(--color-text-medium, #475569)', lineHeight: '1.6', margin: 0 }}>{review.comment}</p>
                 {review.photos && review.photos.length > 0 && (
                   <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                     {review.photos.map(p => (
                       <img key={p.id} src={typeof p === 'string' ? p : p.photo} alt={p.caption || ''}
                         style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                     ))}
                   </div>
                 )}
               </div>
             ))}
             {mergedList.length > 5 && (
               <div style={{ textAlign: 'center', marginTop: '24px' }}>
                 <a
                   href={`${basePath}/reviews`}
                   className="btn-see-more"
                   style={{ textDecoration: 'none' }}
                 >
                   See more reviews
                 </a>
               </div>
             )}
          </>
        ) : (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '24px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>No reviews yet.</p>
        )}
      </div>

    </div>
  );
}
