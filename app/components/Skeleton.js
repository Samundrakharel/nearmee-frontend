'use client';

import Logo from './Logo';
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
      {/* ── Header ── */}
      <header className="header" style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div className="header-inner container" style={{ gap: '16px' }}>
          {/* Real logo — not a skeleton */}
          <Logo />
          {/* Search input */}
          <Skeleton
            width="100%"
            height="42px"
            borderRadius="21px"
            style={{ flex: 1, maxWidth: '340px' }}
          />
          {/* Location input */}
          <Skeleton width="160px" height="42px" borderRadius="21px" style={{ flexShrink: 0 }} />
          {/* Search button */}
          <Skeleton width="88px" height="42px" borderRadius="21px" style={{ flexShrink: 0 }} />
        </div>
      </header>

      {/* ── Body: sidebar + results ── */}
      <div
        className="category-page"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {/* Left sidebar */}
        <FilterSidebarSkeleton />

        {/* Right: results */}
        <div className="category-results">
          {/* Title + result count */}
          <div className="category-results-header">
            <Skeleton width="55%" height="2rem" style={{ marginBottom: '8px' }} />
            <Skeleton width="160px" height="0.9rem" />
          </div>

          {/* Business cards */}
          {[0, 1, 2].map(i => (
            <BusinessCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Business Detail Page Skeleton ────────────────────────────────────────────
// Mirrors: header / hero image / tabs / 2-col layout (content + sidebar)

export function BusinessDetailSkeleton() {
  return (
    <div className="business-view-page">
      {/* Header */}
      <header className="header" style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div className="header-inner container" style={{ gap: '16px' }}>
          {/* Real logo — not a skeleton */}
          <Logo />
          <Skeleton width="100%" height="42px" borderRadius="21px" style={{ flex: 1, maxWidth: '340px' }} />
          <Skeleton width="160px" height="42px" borderRadius="21px" style={{ flexShrink: 0 }} />
          <Skeleton width="88px" height="42px" borderRadius="21px" style={{ flexShrink: 0 }} />
        </div>
      </header>

      {/* Hero image */}
      <Skeleton
        width="100%"
        height="320px"
        borderRadius="0"
        style={{ display: 'block' }}
      />

      {/* Tabs bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 24px' }}>
        <div
          className="container"
          style={{ display: 'flex', gap: '32px', height: '56px', alignItems: 'center' }}
        >
          {['72px', '56px', '80px', '64px'].map((w, i) => (
            <Skeleton key={i} width={w} height="18px" />
          ))}
        </div>
      </div>

      {/* Body */}
      <main className="business-main" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
        <div className="container">
          <div className="business-layout">
            {/* Left: overview content */}
            <div className="business-content">
              {/* Business name + meta */}
              <Skeleton width="50%" height="2rem" style={{ marginBottom: '10px' }} />
              <Skeleton width="25%" height="1rem" style={{ marginBottom: '10px' }} />
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <Skeleton width="90px" height="1rem" />
                <Skeleton width="40px" height="1rem" />
                <Skeleton width="80px" height="1rem" />
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '24px' }}>
                <Skeleton width="14px" height="14px" borderRadius="50%" />
                <Skeleton width="55%" height="1rem" />
              </div>

              {/* Description block */}
              <div style={{ padding: '24px', border: '1px solid #f1f5f9', borderRadius: '16px', marginBottom: '24px' }}>
                <Skeleton width="120px" height="1.4rem" style={{ marginBottom: '16px' }} />
                <Skeleton width="100%" height="1rem" style={{ marginBottom: '10px' }} />
                <Skeleton width="100%" height="1rem" style={{ marginBottom: '10px' }} />
                <Skeleton width="80%" height="1rem" style={{ marginBottom: '10px' }} />
                <Skeleton width="90%" height="1rem" />
              </div>

              {/* Reviews block */}
              <div style={{ padding: '24px', border: '1px solid #f1f5f9', borderRadius: '16px' }}>
                <Skeleton width="100px" height="1.4rem" style={{ marginBottom: '20px' }} />
                {[0, 1].map(i => (
                  <div key={i} style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
                    <CircleSkeleton size="40px" />
                    <div style={{ flex: 1 }}>
                      <Skeleton width="30%" height="1rem" style={{ marginBottom: '8px' }} />
                      <Skeleton width="80px" height="0.9rem" style={{ marginBottom: '8px' }} />
                      <Skeleton width="100%" height="0.9rem" style={{ marginBottom: '6px' }} />
                      <Skeleton width="70%" height="0.9rem" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: sidebar */}
            <aside className="business-sidebar">
              <div style={{ padding: '24px', border: '1px solid #f1f5f9', borderRadius: '16px', marginBottom: '24px' }}>
                {/* Call / directions buttons */}
                <Skeleton width="100%" height="48px" borderRadius="24px" style={{ marginBottom: '12px' }} />
                <Skeleton width="100%" height="48px" borderRadius="24px" style={{ marginBottom: '24px' }} />

                {/* Info rows: phone, address, hours */}
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
                    <Skeleton width="18px" height="18px" borderRadius="50%" style={{ flexShrink: 0 }} />
                    <Skeleton width="75%" height="0.9rem" />
                  </div>
                ))}

                {/* Mini map */}
                <Skeleton width="100%" height="160px" borderRadius="12px" style={{ marginTop: '16px' }} />
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
