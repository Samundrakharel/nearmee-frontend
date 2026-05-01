'use client';

import { useRef, useState } from 'react';

export default function BusinessMenu({ business, setActiveTab }) {
  const menuImages = business.menuImages || [];
  const menuItems = business.menuItems || [];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      console.log('Selected files:', files);
      // Logic to actually upload the photo to your API goes here
      // e.g. uploadMenuPhoto(business.id, files[0])
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % menuImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + menuImages.length) % menuImages.length);
  };

  // Handle categories as either strings or objects
  const categories = business.categories || [];

  return (
    <div className="business-menu-fullpage" style={{ padding: '32px 0', background: '#fff', minHeight: '100vh' }}>
      <div className="container">
        {/* Breadcrumb & Header Area */}
        <div className="menu-header-area" style={{ marginBottom: '32px' }}>
          <div className="breadcrumb" style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '24px' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => setActiveTab('Overview')}>{business.name}</span> &gt; <span style={{ color: '#cf8129', fontWeight: '500' }}>Menu</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>{business.seo?.menu_title || `${business.name} Menu`}</h1>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '6px' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>

              <div style={{ color: '#475569', fontSize: '1.05rem', marginBottom: '8px' }}>
                {categories.length > 0 ? (
                  categories.map((cat, index) => {
                    const catName = typeof cat === 'string' ? cat : cat.name;
                    return (
                      <span key={index}>
                        <a href="#" style={{ color: '#475569', textDecoration: 'underline', textDecorationColor: '#cbd5e1' }}>{catName}</a>
                        {index < categories.length - 1 && ', '}
                      </span>
                    );
                  })
                ) : business.type ? (
                  <span style={{ color: '#475569' }}>{business.type}</span>
                ) : null}
              </div>

              <button
                onClick={() => {
                  setActiveTab('Overview');
                  setTimeout(() => {
                    const el = document.getElementById('business-map');
                    if (el) {
                      const yOffset = -100;
                      const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }, 100);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '1.05rem', marginBottom: '8px', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'transparent', transition: 'all 0.2s', textAlign: 'left' }}
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
              </button>

              {business.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '1.05rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  <span>{business.phone}</span>
                </div>
              )}
            </div>

            {/* <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#334155', fontWeight: '600', textDecoration: 'underline', marginTop: '72px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Suggest an edit
            </button> */}
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

          {/* Left Column: About Menu / Menu Items */}
          <div style={{ flex: '0 0 500px', background: '#f8fafc', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>
              {menuItems.length > 0 ? 'Menu Items' : 'About Menu'}
            </h2>

            <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '12px' }}>
              {menuItems.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {menuItems.map((item, idx) => (
                    <div key={idx} style={{
                      padding: '16px',
                      background: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', margin: 0 }}>{item.name}</h4>
                        {item.price && (
                          <span style={{ fontSize: '1rem', fontWeight: '600', color: '#0d7377' }}>
                            {item.price.startsWith('$') ? item.price : `$${item.price}`}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '32px' }}>
                  {business.menuAbout || business.about || business.description || 'Menu information coming soon.'}
                </p>
              )}

              {business.mustTryDishes && business.mustTryDishes.length > 0 && (
                <div style={{ marginBottom: '40px', marginTop: '24px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '500', color: '#475569', marginBottom: '16px' }}>Must-Try Dishes:</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {business.mustTryDishes.map((dish, idx) => (
                      <li key={idx} style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        - <span style={{ fontWeight: '500' }}>{dish.name}:</span> {dish.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/*"
                multiple
              />
              <button
                className="btn-login"
                onClick={() => fileInputRef.current?.click()}
                style={{ padding: '8px 24px', fontSize: '0.95rem' }}
              >
                Add menu photos
              </button>
            </div>
          </div>

          {/* Right Column: Menu Images */}
          <div style={{ flex: '1', background: '#1e293b', borderRadius: '16px', overflow: 'hidden', position: 'relative', minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {menuImages.length > 0 ? (
              <>
                <img
                  src={typeof menuImages[currentImageIndex] === 'string' ? menuImages[currentImageIndex] : menuImages[currentImageIndex]?.image}
                  alt={`Menu page ${currentImageIndex + 1}`}
                  style={{ maxWidth: '100%', maxHeight: '750px', objectFit: 'contain' }}
                />

                {/* Navigation Controls */}
                <button onClick={prevImage} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.95)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>

                <button onClick={nextImage} style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.95)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>

                {/* Page Indicator */}
                <div style={{ position: 'absolute', right: '24px', bottom: '24px', background: 'rgba(255,255,255,0.95)', padding: '4px 14px', borderRadius: '16px', fontSize: '0.95rem', fontWeight: '600', color: '#0f172a', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                  {currentImageIndex + 1}/{menuImages.length}
                </div>
              </>
            ) : (
              <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '12px' }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p>No menu images available.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
