'use client';

export default function BusinessSidebar({ business, activeTab }) {
  // Parse hours — could be array, JSON string, or null
  let hoursArray = [];
  if (Array.isArray(business.hours)) {
    hoursArray = business.hours;
  } else if (typeof business.hours === 'string') {
    try { hoursArray = JSON.parse(business.hours); } catch { hoursArray = []; }
  }

  const reviewCategories = business.reviewCategories || [];

  return (
    <aside className="business-sidebar" style={{ height: '100%' }}>
      {activeTab === 'Overview' && reviewCategories.length > 0 && (
        <div className="sidebar-card ratings-card" style={{ marginBottom: '24px', padding: '24px', background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reviewCategories.map((cat, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.05rem', color: '#475569' }}>{cat.name}</span>
                  <span style={{ fontSize: '1.05rem', color: '#475569' }}>{Number(cat.rating).toFixed(1)}</span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${(cat.rating / 10) * 100}%`,
                    height: '100%',
                    background: '#509597',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hoursArray.length > 0 && (
        <div className="sidebar-card hours-card" style={{ marginBottom: '24px', padding: '24px', background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', color: '#0f172a' }}>Business Hours</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {hoursArray.map((item, index) => (
              <div key={item.day || index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: item.current ? '#0d7377' : '#475569', fontWeight: item.current ? '700' : '500' }}>
                <span>{item.day}</span>
                <span>{item.time || item.hours || ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="sidebar-card contact-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', color: '#0f172a' }}>Contact Information</h3>
        <div className="contact-info">
          {business.phone && (
            <div className="contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
              </svg>
              <a href={`tel:${business.phone}`}>{business.phone}</a>
            </div>
          )}
          {business.website && (
            <div className="contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
              <a href={business.website} target="_blank" rel="noopener noreferrer">Visit Website</a>
            </div>
          )}
          {business.address && (
            <div className="contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{business.address}</span>
            </div>
          )}
        </div>

        <div className="map-preview" style={{ marginTop: '24px' }}>
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
            style={{ width: '100%', display: 'block', padding: '12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontWeight: '600', cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}
          >
            Get Directions
          </a>
        </div>
      </div>
    </aside>
  );
}
