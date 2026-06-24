'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isLoggedIn, getMyMenuPhotos } from '../lib/api';

export default function BusinessPhotos({ business }) {
  const pathname = usePathname();
  const basePath = pathname
    .replace(/\/(menu|reviews|photos)\/?$/, '')
    .replace(/\/$/, '') || '';

  const [userPhotos, setUserPhotos] = useState([]);

  const fetchUserPhotos = async () => {
    if (!isLoggedIn()) return;
    try {
      const data = await getMyMenuPhotos();
      const filtered = (data || [])
        .filter(p => p.business === business.id)
        .map(p => ({
          id: p.id,
          image: p.photo,
          status: p.status,
          caption: p.caption
        }));
      setUserPhotos(filtered);
    } catch (err) {
      console.error('Failed to fetch user menu photos:', err);
    }
  };

  useEffect(() => {
    fetchUserPhotos();
    window.addEventListener('nearmee-photo-added', fetchUserPhotos);
    return () => window.removeEventListener('nearmee-photo-added', fetchUserPhotos);
  }, [business.id]);

  const rawPhotos = business.photos || [];
  const publicPhotos = rawPhotos.filter(Boolean).map(p => {
    if (typeof p === 'string') {
      return { image: p, status: 'approved' };
    }
    return {
      image: p?.image || p?.google_photo_reference,
      status: 'approved'
    };
  }).filter(p => p.image);

  const mergedPhotos = [...publicPhotos];
  userPhotos.forEach(up => {
    const exists = publicPhotos.some(p => p.image === up.image);
    if (!exists) {
      mergedPhotos.unshift(up); // Prepend so it is at the start!
    }
  });

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
        {mergedPhotos.map((photo, index) => (
          <div key={index} className="photo-item" style={{
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            aspectRatio: '1/1',
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            position: 'relative',
          }}>
            <img
              src={photo.image}
              alt={`Photo ${index + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onMouseOver={(e) => e.currentTarget.parentElement.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.parentElement.style.transform = 'scale(1)'}
            />
            {photo.status && photo.status !== 'approved' && (
              <span style={{
                position: 'absolute', bottom: '12px', left: '12px', right: '12px',
                padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '600',
                background: '#fef3c7', color: '#92400e', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                Pending Approval
              </span>
            )}
          </div>
        ))}
        <div className="photo-item add-photo-btn" 
          onClick={() => window.dispatchEvent(new CustomEvent('nearmee-open-add-photo', { detail: { businessId: business.id } }))}
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
