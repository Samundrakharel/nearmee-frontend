'use client';

export default function BusinessReviews({ business }) {
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
          <span key={i} style={{ color: i <= rating ? 'var(--color-star)' : '#ddd', fontSize: size }}>★</span>
        );
    }
    return <div style={{ display: 'flex', gap: '2px' }}>{stars}</div>;
  }

  return (
    <div className="business-reviews-tab" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="rating-summary-card" style={{ 
        background: '#fff', 
        padding: '32px', 
        borderRadius: 'var(--radius-md)', 
        border: '1px solid var(--color-border)',
        marginBottom: '32px'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px', color: 'var(--color-text-dark)' }}>Rating Summary</h2>
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          <div className="rating-overall" style={{ textAlign: 'center', minWidth: '100px' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1', marginBottom: '8px' }}>{avgRating || '-'}</div>
            <div style={{ marginBottom: '8px' }}>
               <StarRating rating={Math.round(avgRating)} size="1.25rem" />
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-medium)' }}>{totalReviews} reviews</div>
          </div>

          <div className="rating-bars" style={{ flex: 1 }}>
          {starPercentages.map((item) => (
            <div key={item.star} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-medium)', width: '45px', flexShrink: 0 }}>{item.star} stars</span>
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

      {/* Reviews List */}
      <div className="reviews-list">
        {list.length > 0 ? list.map((review, index) => (
          <div key={index} className="review-card" style={{ 
            background: '#fff', 
            padding: '24px', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--color-border)',
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
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-text-dark)' }}>{review.user}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{review.date}</span>
                </div>
              </div>
              <StarRating rating={review.rating} />
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-medium)', lineHeight: '1.6' }}>{review.comment}</p>
          </div>
        )) : (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '24px' }}>No reviews yet.</p>
        )}
      </div>
    </div>
  );
}
