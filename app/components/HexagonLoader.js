'use client';

import { LoadingIcon } from './LoadingIcon';

/**
 * HexagonLoader — used as the loading state for all pages.
 * Uses the existing LoadingIcon (snake-crawling hexagon) in the site's primary blue.
 */
export default function HexagonLoader({ label = 'Almost there…' }) {
  return (
    <div className="hex-loader-wrap">
      {/* near me wordmark — on top */}
      <svg
        width="100"
        height="35"
        viewBox="0 0 110 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.85 }}
      >
        <text
          x="0" y="28"
          fontFamily="Inter, sans-serif"
          fontWeight="800"
          fontSize="24"
          fill="#3b82f6"
          style={{ letterSpacing: '-1px' }}
        >near</text>
        <circle cx="75" cy="20" r="18" fill="#3b82f6" />
        <text
          x="60" y="28"
          fontFamily="Inter, sans-serif"
          fontWeight="800"
          fontSize="24"
          fill="white"
          style={{ letterSpacing: '-1px' }}
        >me</text>
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
