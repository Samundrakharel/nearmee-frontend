'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCurrentMonthLabel } from '../lib/use-current-month';
import { getBusinessSubdomainUrl, getCategoryRoute } from '../lib/api';
import AddPhotoButton from './AddPhotoButton';

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
 */
function chunkMenuItems(items) {
  const cards = [];
  for (let i = 0; i < items.length; i += ITEMS_PER_CARD) {
    cards.push(items.slice(i, i + ITEMS_PER_CARD));
  }
  return cards;
}

/* ─── Menu Image Carousel ───────────────────────────────────── */

function MenuCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="menu-carousel-wrapper">
        <div className="menu-carousel-empty">
          <span>No menu images available</span>
        </div>
      </div>
    );
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const currentImage = typeof images[currentIndex] === 'string'
    ? images[currentIndex]
    : images[currentIndex]?.image || images[currentIndex]?.url || '';

  return (
    <div className="menu-carousel-wrapper">
      <img
        src={currentImage}
        alt={`Menu page ${currentIndex + 1}`}
        className="menu-carousel-image"
        loading="lazy"
      />
      {images.length > 1 && (
        <>
          <button
            className="menu-carousel-btn prev"
            onClick={goToPrev}
            aria-label="Previous menu image"
          >
            ‹
          </button>
          <button
            className="menu-carousel-btn next"
            onClick={goToNext}
            aria-label="Next menu image"
          >
            ›
          </button>
          <div className="menu-carousel-indicator">
            {currentIndex + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Related Menu Searches ────────────────────────────────── */

function RelatedMenuSearches({ businesses }) {
  if (!businesses || businesses.length === 0) return null;

  return (
    <div className="menu-related-section">
      <h2>Related Menu Searches</h2>
      <div className="menu-related-grid">
        {businesses.map((biz) => {
          const link = getBusinessSubdomainUrl(biz.slug || biz.id);
          const cats = Array.isArray(biz.categories)
            ? biz.categories.map(c => typeof c === 'string' ? c : c.name)
            : (biz.type ? [biz.type] : []);

          return (
            <a
              key={biz.id || biz.slug}
              href={`${link}/menu`}
              className="menu-related-card"
            >
              {biz.image || biz.thumbnail || biz.coverImage ? (
                <img
                  src={biz.image || biz.thumbnail || biz.coverImage}
                  alt={biz.name}
                  className="menu-related-card-image"
                  loading="lazy"
                />
              ) : (
                <div className="menu-related-card-image-placeholder">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
              <div className="menu-related-card-body">
                <h3 className="menu-related-card-name">{biz.name}</h3>
                {cats.length > 0 && (
                  <div className="menu-related-card-categories">
                    {cats.map((cat, i) => (
                      <span key={i}>
                        {cat}
                        {i < cats.length - 1 && (
                          <span className="cat-separator">|</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
                {biz.address && (
                  <div className="menu-related-card-address">{biz.address}</div>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Highly Searched ──────────────────────────────────────── */

function HighlySearched({ categories, countryName, locationInfo }) {
  if (!categories || categories.length === 0) return null;

  const displayCountry = countryName || 'your area';

  return (
    <div className="menu-highly-searched">
      <h2>Highly Searched in {displayCountry}</h2>
      <ul className="menu-highly-searched-grid">
        {categories.slice(0, 9).map((cat) => {
          const catName = typeof cat === 'string' ? cat : (cat.name || '');
          const catSlug = typeof cat === 'string'
            ? cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            : (cat.slug || '');

          const href = locationInfo
            ? getCategoryRoute(catSlug, locationInfo)
            : `/category/${catSlug}`;

          return (
            <li key={catSlug || catName}>
              <a href={href}>
                {catName} in {displayCountry}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────── */

export default function BusinessMenu({
  business,
  relatedBusinesses = [],
  allCategories = [],
  countryName = '',
  locationInfo = null,
}) {
  const pathname = usePathname();
  const basePath = pathname
    .replace(/\/(menu|reviews)\/?$/, '')
    .replace(/\/$/, '') || '';

  const menuItems = business.menuItems || [];
  const menuImages = business.menuImages || [];
  const cards = chunkMenuItems(menuItems);

  const categories = business.categories || [];
  const updatedLabel = useCurrentMonthLabel();
  const aboutText = business.menuAbout || business.about || business.description || '';

  return (
    <div className="business-menu-fullpage" style={{ padding: '32px 0', background: '#fff', minHeight: '100vh' }}>
      <style>{`
        .menu-card-grid {
          display: grid;
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
        <div className="menu-header-area" style={{ marginBottom: '8px' }}>
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

        {/* ─── Section 1: About Menu + Menu Image Carousel ─── */}
        <div className="menu-about-section">
          <div className="menu-about-left">
            <h2>About Menu</h2>
            {aboutText && (
              <p className="menu-about-text">{aboutText}</p>
            )}

            {business.mustTryDishes && business.mustTryDishes.length > 0 && (
              <>
                <h3 className="menu-must-try-heading">Must-Try Dishes:</h3>
                <ul className="menu-must-try-list">
                  {business.mustTryDishes.map((dish, idx) => (
                    <li key={idx}>
                      - <strong>{dish.name}:</strong> {dish.description}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div style={{ marginTop: 'auto' }}>
              <AddPhotoButton
                businessId={business.id}
                businessSlug={business.slug}
              />
            </div>
          </div>

          <div>
            <MenuCarousel images={menuImages} />
          </div>
        </div>

        {/* ─── Section 2: Menu Items ─── */}
        {menuItems.length > 0 && (
          <div className="menu-items-section">
            <div className="menu-items-section-header">
              <h2>Menu Items</h2>
              <span className="menu-items-count">
                {menuItems.length} item{menuItems.length === 1 ? '' : 's'}
              </span>
            </div>

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
          </div>
        )}

        {/* ─── Section 3: Related Menu Searches ─── */}
        <RelatedMenuSearches businesses={relatedBusinesses} />

        {/* ─── Section 4: Highly Searched ─── */}
        <HighlySearched
          categories={allCategories}
          countryName={countryName}
          locationInfo={locationInfo}
        />
      </div>
    </div>
  );
}
