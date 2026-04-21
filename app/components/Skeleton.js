'use client';

import Logo from './Logo';
import HexagonLoader, { HexagonOverlay } from './HexagonLoader';
export default function Skeleton({ width, height, borderRadius, style, className = '' }) {
  return (
    <div
      className={`skeleton-box ${className}`}
      style={{
        width: width || '100%',
        height: height || '1em',
        borderRadius: borderRadius || '6px',
        display: 'block',
        ...style,
      }}
    />
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

export function CircleSkeleton({ size = '48px' }) {
  return <Skeleton width={size} height={size} borderRadius="50%" />;
}

// ─── Business Card Skeleton ────────────────────────────────────────────────────
// Mirrors: image thumbnail | name / type / stars / address / button

export function BusinessCardSkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        gap: '20px',
        padding: '20px',
        borderRadius: '16px',
        border: '1px solid #f1f5f9',
        background: '#fff',
        marginBottom: '16px',
      }}
    >
      {/* Thumbnail */}
      <Skeleton
        width="130px"
        height="130px"
        borderRadius="12px"
        style={{ flexShrink: 0 }}
      />

      {/* Info column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* Name */}
        <Skeleton width="45%" height="1.5rem" style={{ marginBottom: '8px' }} />
        {/* Type / category label */}
        <Skeleton width="25%" height="1rem" style={{ marginBottom: '10px' }} />
        {/* Stars + rating + review count */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
          <Skeleton width="90px" height="1rem" />
          <Skeleton width="36px" height="1rem" />
          <Skeleton width="72px" height="1rem" />
        </div>
        {/* Address row */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '16px' }}>
          <Skeleton width="14px" height="14px" borderRadius="50%" style={{ flexShrink: 0 }} />
          <Skeleton width="65%" height="0.9rem" />
        </div>
        {/* View Business button */}
        <Skeleton width="130px" height="38px" borderRadius="10px" />
      </div>
    </div>
  );
}

// ─── Category Card Skeleton ────────────────────────────────────────────────────
// Mirrors: centred icon circle / name / count

export function CategoryCardSkeleton() {
  return (
    <div
      style={{
        minWidth: '320px',
        height: '180px',
        borderRadius: '16px',
        background: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        gap: '14px',
        border: '1px solid #f1f5f9',
        flexShrink: 0,
      }}
    >
      <CircleSkeleton size="64px" />
      <Skeleton width="120px" height="1.2rem" />
      <Skeleton width="80px" height="0.85rem" />
    </div>
  );
}

// ─── Category Results Page Skeleton ───────────────────────────────────────────
// Mirrors EXACTLY the layout seen in the screenshot:
//   header | 260px sidebar + main column (title + count + cards)

function FilterSidebarSkeleton() {
  return (
    <aside
      style={{
        width: '260px',
        flexShrink: 0,
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid #f1f5f9',
        background: '#fff',
        alignSelf: 'start',
        // sticky so it scrolls with the content just like the real sidebar
        position: 'sticky',
        top: 'calc(var(--header-height, 72px) + 24px)',
      }}
    >
      {/* "Filters" heading */}
      <Skeleton width="80px" height="1.4rem" style={{ marginBottom: '24px' }} />

      {/* Rating group */}
      <Skeleton width="60px" height="0.95rem" style={{ marginBottom: '14px' }} />
      {['100%', '90%', '80%'].map((w, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Skeleton width="18px" height="18px" borderRadius="4px" style={{ flexShrink: 0 }} />
          <Skeleton width={w} height="0.9rem" />
        </div>
      ))}

      {/* Neighbourhood group */}
      <Skeleton width="100px" height="0.95rem" style={{ margin: '20px 0 14px' }} />
      {['100%', '85%', '75%', '90%'].map((w, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Skeleton width="18px" height="18px" borderRadius="4px" style={{ flexShrink: 0 }} />
          <Skeleton width={w} height="0.9rem" />
        </div>
      ))}

      {/* Apply Filters button */}
      <Skeleton width="100%" height="44px" borderRadius="22px" style={{ marginTop: '16px' }} />
    </aside>
  );
}

export function CategoryResultsSkeleton() {
  return (
    <>
      <HexagonOverlay label="Finding businesses…" />
    </>
  );
}

// ─── Business Detail Page Skeleton ────────────────────────────────────────────
// Mirrors: header / hero image / tabs / 2-col layout (content + sidebar)

export function BusinessDetailSkeleton() {
  return (
    <div className="business-view-page">
      {/* Real header */}
      <header className="header" style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div className="header-inner container" style={{ gap: '16px' }}>
          <Logo />
          <Skeleton width="100%" height="42px" borderRadius="21px" style={{ flex: 1, maxWidth: '340px' }} />
          <Skeleton width="160px" height="42px" borderRadius="21px" style={{ flexShrink: 0 }} />
          <Skeleton width="88px" height="42px" borderRadius="21px" style={{ flexShrink: 0 }} />
        </div>
      </header>

      {/* Hero */}
      <Skeleton width="100%" height="320px" borderRadius="0" />

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
        <div className="container" style={{ display: 'flex', gap: '32px', height: '60px', alignItems: 'center' }}>
          <Skeleton width="80px" height="24px" />
          <Skeleton width="90px" height="24px" />
          <Skeleton width="70px" height="24px" />
        </div>
      </div>

      <main className="business-main" style={{ padding: '40px 0' }}>
        <div className="container">
          <div className="business-layout" style={{ display: 'flex', gap: '40px' }}>
            <div className="business-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Skeleton width="60%" height="32px" />
              <Skeleton width="100%" height="100px" borderRadius="12px" />
              <Skeleton width="100%" height="150px" borderRadius="12px" />
            </div>
            {/* Sidebar */}
            <aside style={{ width: '320px', flexShrink: 0 }}>
              <Skeleton width="100%" height="300px" borderRadius="16px" />
            </aside>
          </div>
        </div>
      </main>

      {/* Hexagon loader overlay */}
      <HexagonOverlay label="Loading business…" />
    </div>
  );
}
