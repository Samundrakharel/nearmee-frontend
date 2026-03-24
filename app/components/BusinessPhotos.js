'use client';

export default function BusinessPhotos({ business }) {
  const rawPhotos = business.photos || [];
  const photos = rawPhotos.filter(Boolean).map(p => typeof p === 'string' ? p : p?.image || p?.google_photo_reference).filter(Boolean);

  return (
    <div className="business-photos-tab">
      <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '32px', color: 'var(--color-text-dark)' }}>Photos</h2>
      <div className="photos-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        {photos.map((photo, index) => (
          <div key={index} className="photo-item" style={{
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            aspectRatio: '1/1',
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}>
            <img
              src={photo}
              alt={`Photo ${index + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onMouseOver={(e) => e.currentTarget.parentElement.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.parentElement.style.transform = 'scale(1)'}
            />
          </div>
        ))}
        {/* Add Photos Field */}
        <div className="photo-item add-photo-btn" style={{
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          aspectRatio: '1/1',
          border: '2px dashed #cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          background: '#f8fafc',
          color: 'var(--color-primary)',
          gap: '12px',
          transition: 'all 0.2s'
        }}
          onMouseOver={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = 'var(--color-primary-light)'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>Add Photos</span>
        </div>
      </div>
    </div>
  );
}
