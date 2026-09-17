'use client';

import { LoadingIcon } from './LoadingIcon';

/**
 * BrandLoader — the loading state for all pages: the wordmark above the brand
 * dot rippling outwards.
 *
 * `label` is only rendered when a caller supplies one. There is no default
 * because a generic "Almost there…" claims progress the loader cannot know;
 * callers that can say something true ("Signing In…") pass it in.
 */
export default function BrandLoader({ label }) {
  return (
    <div className="brand-loader-wrap">
      <svg
        width="220"
        height="35"
        viewBox="0 0 240 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.85 }}
      >
        <text
          x="0" y="28"
          fontFamily="Inter, sans-serif"
          fontWeight="800"
          fontSize="24"
          fill="#18181b"
          style={{ letterSpacing: '-1px' }}
        >doers</text>
        <text
          x="72" y="28"
          fontFamily="Inter, sans-serif"
          fontWeight="800"
          fontSize="24"
          fill="#ff7e67"
          style={{ letterSpacing: '-0.5px' }}
        >marketing</text>
        <circle cx="204" cy="24" r="4" fill="#ff7e67" />
      </svg>

      <LoadingIcon size={56} className="brand-loader-icon" />

      {label && <span className="brand-loader-label">{label}</span>}
    </div>
  );
}

export function BrandOverlay({ label }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255, 255, 255, 0.5)',
      backdropFilter: 'blur(2px)',
      zIndex: 9999
    }}>
      <BrandLoader label={label} />
    </div>
  );
}
