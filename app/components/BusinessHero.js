'use client';

export default function BusinessHero({ business }) {
  return (
    <div className="business-hero-wrapper">
      <div className="business-cover" style={{ height: '320px', width: '100%', overflow: 'hidden', position: 'relative' }}>
        {(business.coverImage || business.thumbnail) ? (
          <img
            src={business.coverImage || business.thumbnail}
            alt={business.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1e3a5f 0%, #0d7377 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 100%)' }} />
      </div>
      <div className="business-hero-info" style={{ background: '#fff', padding: '32px 0 24px' }}>
        <div className="container">
          <div className="business-title-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: '800', lineHeight: '1.2', margin: 0, color: '#0f172a' }}>{business.name}</h1>
            </div>
          </div>

          <div className="business-categories" style={{ color: 'var(--color-text-medium)', fontSize: '1.05rem', marginBottom: '8px' }}>
            {business.categories && business.categories.length > 0 ? (
              business.categories.map((cat, index) => {
                const catName = typeof cat === 'string' ? cat : cat.name;
                return (
                  <span key={index}>
                    <a href="#" style={{ color: '#475569', textDecoration: 'underline', textDecorationColor: '#cbd5e1' }}>{catName}</a>
                    {index < business.categories.length - 1 && ', '}
                  </span>
                );
              })
            ) : business.type ? (
              <span style={{ color: '#475569' }}>{business.type}</span>
            ) : null}
          </div>

          <button
            className="business-address-hero"
            onClick={() => {
              const el = document.getElementById('business-map');
              if (el) {
                const yOffset = -100; // offset for sticky header
                const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#475569',
              fontSize: '1.05rem',
              marginBottom: '12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              textAlign: 'left',
              textDecoration: 'underline',
              textDecorationColor: 'transparent',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = 'var(--color-primary)';
              e.currentTarget.style.textDecorationColor = 'var(--color-primary)';
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
          </button>

          <div className="business-meta-row" style={{ display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
            <div className="business-status" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ color: business.isOpen ? '#059669' : '#b91c1c', fontWeight: '600', fontSize: '1.05rem' }}>
                {business.openState || (business.isOpen ? 'Open' : 'Closed')}
              </span>
              <button
                className="btn-login"
                onClick={() => {
                  const el = document.getElementById('business-hours');
                  if (el) {
                    const yOffset = -100; // offset for sticky header
                    const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }}
              >
                See Hours
              </button>
            </div>

            {business.phone && (
              <div className="business-phone" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '1.1rem', fontWeight: '600' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                </div>
                <a href={`tel:${business.phone}`} style={{ textDecoration: 'none', color: 'inherit' }}>{business.phone}</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
