'use client';

export default function BusinessSidebar({ business, activeTab }) {
  const fullDays = { 'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday', 'Thu': 'Thursday', 'Fri': 'Friday', 'Sat': 'Saturday', 'Sun': 'Sunday' };
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'P.M' : 'A.M';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    return `${String(hours).padStart(2, '0')}:${m} ${ampm}`;
  };

  let parsedHours = {};
  if (typeof business.hours === 'object' && business.hours !== null && !Array.isArray(business.hours)) {
    parsedHours = business.hours;
  } else if (typeof business.hours === 'string') {
    try { 
      const parsed = JSON.parse(business.hours);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        parsedHours = parsed;
      }
    } catch { }
  }

  const reviewCategories = business.reviewCategories || [];

  return (
    <aside className="business-sidebar" style={{ height: 'auto' }}>
      <div className="sidebar-card contact-card glass" style={{ border: '1px solid var(--color-border)', borderRadius: '20px', padding: '28px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', color: '#0f172a' }}>Contact Info</h3>
        <div className="contact-info" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {business.phone && (
            <div className="contact-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569', fontSize: '1rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
              </svg>
              <a href={`tel:${business.phone}`} style={{ fontWeight: 600 }}>{business.phone}</a>
            </div>
          )}
          {business.website && (
            <div className="contact-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569', fontSize: '1rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
              <a href={business.website} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600 }}>Visit Website</a>
            </div>
          )}
          {business.address && (
            <div className="contact-item" style={{ display: 'flex', alignItems: 'start', gap: '12px', color: '#475569', fontSize: '1rem', lineHeight: '1.4' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '3px', flexShrink: 0 }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span style={{ fontWeight: 500 }}>{business.address}</span>
            </div>
          )}
        </div>

        <div id="business-map" className="map-preview" style={{ marginTop: '24px' }}>
          {business.lat && business.lng ? (
            <iframe
              width="100%"
              height="335"
              style={{ border: 0, borderRadius: '8px', marginBottom: '16px' }}
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps?q=${encodeURIComponent((business.name || '') + ' ' + (business.address || ''))}&z=15&output=embed`}
            ></iframe>
          ) : (
            <div className="map-placeholder" style={{ minHeight: '250px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
          )}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent((business.name || '') + ' ' + (business.address || ''))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-directions"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: 'var(--color-primary)', border: 'none', borderRadius: '14px', color: '#fff', fontWeight: '700', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', transition: 'var(--transition-smooth)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
            Get Directions
          </a>
        </div>

        {reviewCategories.length > 0 && (() => {
          const avgRating = reviewCategories.reduce((acc, cat) => acc + Number(cat.rating), 0) / reviewCategories.length;
          const displayRating = avgRating.toFixed(1);
          let textRating = 'Good';
          if (avgRating >= 9) textRating = 'Exceptional';
          else if (avgRating >= 8) textRating = 'Excellent';
          else if (avgRating >= 7) textRating = 'Very Good';
          
          return (
            <div className="ratings-section" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '24px', color: '#509597', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {displayRating} <span style={{ color: '#cbd5e1', fontWeight: '300' }}>|</span> {textRating}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {reviewCategories.map((cat, index) => (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.05rem', color: '#475569' }}>{cat.name}</span>
                      <span style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: '500' }}>
                        {Number(cat.rating).toString()}
                      </span>
                    </div>
                    <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${(cat.rating / 10) * 100}%`,
                        height: '100%',
                        background: '#509597',
                        borderRadius: '6px'
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {Object.keys(parsedHours).length > 0 && (
          <div id="business-hours" className="hours-section" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', color: '#004b91' }}>Hours</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(dayCode => {
                const dayData = parsedHours[dayCode];
                if (!dayData) return null;
                const timeText = (dayData.open && dayData.close) 
                  ? `${formatTime(dayData.open)} - ${formatTime(dayData.close)}` 
                  : ((dayData.closed || dayData.isClosed) ? 'Closed' : 'N/A');
                
                return (
                  <div key={dayCode} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: '#475569', fontWeight: '400' }}>
                    <span>{fullDays[dayCode]}</span>
                    <span>{timeText}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
