'use client';

export default function BusinessReviews({ business, setActiveTab }) {
  const reviews = business.reviews || { summary: {}, list: [] };
  const { list = [] } = reviews;

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
  const topReviews = list.slice(0, 5);

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
            ))}
            {list.length > 5 && (
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <button 
                  onClick={() => setActiveTab('FullReviews')}
                  className="btn-see-more"
                >
                  See more reviews
                </button>
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
