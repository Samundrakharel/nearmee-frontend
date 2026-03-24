'use client';

export default function BusinessOverview({ business, setActiveTab }) {
  const photos = business.photos || [];
  const amenities = business.amenities || [];
  const faqs = business.faqs || [];

  return (
    <div className="business-overview">
      <section className="overview-section" id="about">
        <h2>About</h2>
        <p>{business.about || business.description || 'No description available.'}</p>
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

      {amenities.length > 0 && (
        <section className="overview-section" id="amenities">
          <h2>Amenities</h2>
          <div className="amenities-grid">
            {amenities.map((amenity, index) => (
              <div key={index} className="amenity-item">
                <span className="dot"></span>
                {typeof amenity === 'string' ? amenity : amenity.name}
              </div>
            ))}
          </div>
        </section>
      )}

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
