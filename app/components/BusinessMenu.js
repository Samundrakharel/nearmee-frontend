'use client';

import { usePathname } from 'next/navigation';
import { useCurrentMonthLabel } from '../lib/use-current-month';

function formatPrice(price) {
  if (price === null || price === undefined || price === '') return '';
  const str = String(price);
  return str.startsWith('$') ? str : `$${str}`;
}

const ITEMS_PER_CARD = 5;

/**
 * Deal the menu into cards of five.
 *
 * The order is deliberately left exactly as the API returned it — no
 * alphabetising, no sorting, no re-ordering of any kind. The cards are just
 * consecutive slices, so each one holds an arbitrary handful of the menu.
 * (Shuffling per render is avoided on purpose: this component is server
 * rendered, so a fresh random order on the client would not match the server's
 * HTML and React would throw a hydration mismatch.)
 */
function chunkMenuItems(items) {
  const cards = [];
  for (let i = 0; i < items.length; i += ITEMS_PER_CARD) {
    cards.push(items.slice(i, i + ITEMS_PER_CARD));
  }
  return cards;
}

export default function BusinessMenu({ business }) {
  const pathname = usePathname();
  const basePath = pathname
    .replace(/\/(menu|reviews)\/?$/, '')
    .replace(/\/$/, '') || '';

  const menuItems = business.menuItems || [];
  const cards = chunkMenuItems(menuItems);

  // Handle categories as either strings or objects
  const categories = business.categories || [];

  const updatedLabel = useCurrentMonthLabel();

  return (
    <div className="business-menu-fullpage" style={{ padding: '32px 0', background: '#fff', minHeight: '100vh' }}>
      <style>{`
        /* Each card holds five menu items. */
        .menu-card-grid {
          display: grid;
          /* min() keeps the track from forcing a floor wider than the screen
             on narrow phones, which would push the page sideways. */
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
          gap: 20px;
          align-items: start;
        }
        .menu-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 8px 20px;
          transition: border-color 0.2s, box-shadow 0.2s;
          /* Grid items default to min-width:auto and would otherwise stretch
             the track to fit the longest item name. */
          min-width: 0;
        }
        .menu-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.07);
        }

        .menu-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 16px 0;
          border-top: 1px solid #f1f5f9;
        }
        .menu-item:first-child { border-top: none; }

        .menu-item-thumb {
          width: 56px;
          height: 56px;
          flex-shrink: 0;
          object-fit: cover;
          border-radius: 8px;
          display: block;
          background: #f1f5f9;
        }
        .menu-item-body { flex: 1; min-width: 0; }
        .menu-item-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
        }
        .menu-item-name {
          font-size: 0.98rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
          line-height: 1.4;
          /* Scraped item names can be long unbroken strings. "anywhere" rather
             than "break-word" because only anywhere shrinks the element's
             min-content width, which is what the grid track measures. */
          min-width: 0;
          overflow-wrap: anywhere;
        }
        .menu-item-price {
          font-size: 0.98rem;
          font-weight: 700;
          color: #0d7377;
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }
        .menu-item-desc {
          margin: 6px 0 0;
          font-size: 0.88rem;
          color: #64748b;
          line-height: 1.5;
          overflow-wrap: break-word;
        }

        @media (max-width: 640px) {
          .menu-card-grid { grid-template-columns: 1fr; gap: 16px; }
          .menu-card { padding: 4px 16px; }
        }
      `}</style>
      <div className="container">
        {/* Breadcrumb & Header Area */}
        <div className="menu-header-area" style={{ marginBottom: '32px' }}>
          <div className="breadcrumb" style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '24px' }}>
            <a href={basePath || '/'} style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}>{business.name}</a> &gt; <span style={{ color: '#cf8129', fontWeight: '500' }}>Menu</span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <h1 style={{ fontSize: 'clamp(1.5rem, 6vw, 2.5rem)', fontWeight: '800', margin: 0, color: '#0f172a', overflowWrap: 'break-word', wordBreak: 'break-word', minWidth: 0 }}>
                {business.name} - Menu
              </h1>
              <span suppressHydrationWarning style={{ fontSize: '1rem', fontWeight: '400', color: '#64748b', whiteSpace: 'nowrap' }}>
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
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              {menuItems.length > 0 ? 'Menu Items' : 'About Menu'}
            </h2>
            {menuItems.length > 0 && (
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                {menuItems.length} item{menuItems.length === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {menuItems.length > 0 ? (
            <div className="menu-card-grid">
              {cards.map((cardItems, cardIdx) => (
                <div className="menu-card" key={cardIdx}>
                  {cardItems.map((item, idx) => (
                    <article className="menu-item" key={item.id ?? `${cardIdx}-${idx}`}>
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="menu-item-thumb"
                          loading="lazy"
                        />
                      )}
                      <div className="menu-item-body">
                        <div className="menu-item-head">
                          <h3 className="menu-item-name">{item.name}</h3>
                          {formatPrice(item.price) && (
                            <span className="menu-item-price">{formatPrice(item.price)}</span>
                          )}
                        </div>
                        {item.description && (
                          <p className="menu-item-desc">{item.description}</p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ))}
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
