'use client';

import { useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function BusinessPhotos({ business }) {
  const pathname = usePathname();
  const basePath = pathname
    .replace(/\/(menu|reviews|photos)\/?$/, '')
    .replace(/\/$/, '') || '';

  const rawPhotos = business.photos || [];
  const photos = rawPhotos.filter(Boolean).map(p => typeof p === 'string' ? p : p?.image || p?.google_photo_reference).filter(Boolean);

  const fileInputRef = useRef(null);
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      console.log('Selected photos:', files);
      // Logic to actually upload the photo to your API goes here
    }
  };

  const categories = business.categories || [];

  return (
    <div className="business-photos-tab" style={{ padding: '32px 0' }}>
      {/* Breadcrumb Area */}
      <div className="breadcrumb" style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '24px' }}>
        <a href={basePath || '/'} style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}>{business.name}</a> &gt; <span style={{ color: '#cf8129', fontWeight: '500' }}>Photos</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
          {business.name} - Photos
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

      {business.address && (
        <a
          href={`${basePath || '/'}#business-map`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '1.05rem', marginBottom: '32px', textDecoration: 'underline', textDecorationColor: 'transparent', transition: 'all 0.2s' }}
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
      )}
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
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
          accept="image/*" 
          multiple
        />
        <div className="photo-item add-photo-btn" 
          onClick={() => fileInputRef.current?.click()}
          style={{
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
