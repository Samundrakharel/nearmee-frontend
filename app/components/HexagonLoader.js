'use client';

import { LoadingIcon } from './LoadingIcon';

/**
 * HexagonLoader — used as the loading state for all pages.
 * Uses the existing LoadingIcon (snake-crawling hexagon) in the site's primary black.
 */
export default function HexagonLoader({ label = 'Almost there…' }) {
  return (
    <div className="hex-loader-wrap">
      {/* DoersMarketing wordmark — on top */}
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

      {/* Hexagon loading icon — below logo */}
      <LoadingIcon size={64} className="hex-icon" />

      <span className="hex-loader-label">{label}</span>
    </div>
  );
}

export function HexagonOverlay({ label = 'Almost there…' }) {
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
      <HexagonLoader label={label} />
    </div>
  );
}
