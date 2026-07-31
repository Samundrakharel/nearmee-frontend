'use client';

import { usePathname } from 'next/navigation';

export default function BusinessMenu({ business }) {
  const pathname = usePathname();
  const basePath = pathname
    .replace(/\/(menu|reviews)\/?$/, '')
    .replace(/\/$/, '') || '';

  const menuItems = business.menuItems || [];

  // Handle categories as either strings or objects
  const categories = business.categories || [];

  const updatedLabel = new Date(business.updatedAt || Date.now())
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="business-menu-fullpage" style={{ padding: '32px 0', background: '#fff', minHeight: '100vh' }}>
      <div className="container">
        {/* Breadcrumb & Header Area */}
        <div className="menu-header-area" style={{ marginBottom: '32px' }}>
          <div className="breadcrumb" style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '24px' }}>
            <a href={basePath || '/'} style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}>{business.name}</a> &gt; <span style={{ color: '#cf8129', fontWeight: '500' }}>Menu</span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                {business.name} - Menu
              </h1>
              <span style={{ fontSize: '1rem', fontWeight: '400', color: '#64748b', whiteSpace: 'nowrap' }}>
                (updated {updatedLabel})
              </span>
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

            <a
              href={`${basePath || '/'}#business-map`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '1.05rem', marginBottom: '8px', textDecoration: 'underline', textDecorationColor: 'transparent', transition: 'all 0.2s', textAlign: 'left' }}
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

            {business.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '1.05rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
                <span>{business.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>
            {menuItems.length > 0 ? 'Menu Items' : 'About Menu'}
          </h2>

          {menuItems.length > 0 ? (
            <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
                <thead>
                  <tr style={{ background: '#0f172a' }}>
                    <th style={{ textAlign: 'left', padding: '14px 20px', color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>Item</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>Description</th>
                    <th style={{ textAlign: 'right', padding: '14px 20px', color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((item, idx) => (
                    <tr key={idx} style={{ borderTop: idx === 0 ? 'none' : '1px solid #e2e8f0', background: idx % 2 === 1 ? '#f8fafc' : '#fff' }}>
                      <td style={{ padding: '14px 20px', fontWeight: '600', color: '#0f172a', verticalAlign: 'top' }}>{item.name}</td>
                      <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '0.9rem', verticalAlign: 'top' }}>{item.description || '—'}</td>
                      <td style={{ padding: '14px 20px', color: '#0d7377', fontWeight: '600', textAlign: 'right', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                        {item.price ? (String(item.price).startsWith('$') ? item.price : `$${item.price}`) : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {business.menuAbout || 'Menu information coming soon.'}
            </p>
          )}

          {business.mustTryDishes && business.mustTryDishes.length > 0 && (
            <div style={{ marginTop: '32px' }}>
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
      </div>
    </div>
  );
}
