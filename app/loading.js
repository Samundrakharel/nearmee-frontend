'use client';

import Logo from './components/Logo';
import HexagonLoader, { HexagonOverlay } from './components/HexagonLoader';
import Skeleton, { CategoryCardSkeleton, BusinessCardSkeleton } from './components/Skeleton';

export default function Loading() {
  return (
    <div>
      {/* ── Header ── */}
      <header className="header" style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div className="header-inner container" style={{ gap: '16px' }}>
          <Logo />
          <Skeleton
            width="100%"
            height="42px"
            borderRadius="21px"
            style={{ flex: 1, maxWidth: '340px' }}
          />
          <Skeleton width="160px" height="42px" borderRadius="21px" style={{ flexShrink: 0 }} />
          <Skeleton width="88px" height="42px" borderRadius="21px" style={{ flexShrink: 0 }} />
        </div>
      </header>

      {/* ── Hero skeleton ── */}
      <section className="hero" style={{ background: '#1e293b', overflow: 'hidden', position: 'relative' }}>
        <div className="hero-content container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <Skeleton width="65%" height="3rem" style={{ margin: '0 auto 18px', display: 'block', background: 'rgba(255,255,255,0.12)' }} />
          <Skeleton width="42%" height="1.4rem" style={{ margin: '0 auto 36px', display: 'block', background: 'rgba(255,255,255,0.08)' }} />
          <Skeleton
            width="100%"
            height="60px"
            borderRadius="30px"
            style={{ maxWidth: '600px', margin: '0 auto', display: 'block', background: 'rgba(255,255,255,0.1)' }}
          />
        </div>
      </section>

      {/* ── Categories skeleton ── */}
      <section className="categories-section" style={{ background: '#f8f9fa' }}>
        <div className="container">
          <Skeleton
            width="280px"
            height="2.2rem"
            style={{ margin: '0 auto 40px', display: 'block' }}
          />
          <div style={{ display: 'flex', gap: '16px', overflow: 'hidden' }}>
            {[0, 1, 2, 3, 4].map(i => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Top Businesses skeleton ── */}
      <section className="businesses-section">
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '28px',
            }}
          >
            <Skeleton width="280px" height="1.75rem" />
            <Skeleton width="60px" height="1rem" />
          </div>

          {[0, 1, 2].map(i => (
            <BusinessCardSkeleton key={i} />
          ))}
        </div>
      </section>

      <HexagonOverlay label="Loading…" />
    </div>
  );
}
