import React from 'react';

// The coral dot from the DoersMarketing wordmark, emitting rings — the loader
// is the logo's own mark rather than an unrelated shape.
export function LoadingIcon({ size = 40, className = '' }) {
  return (
    <div
      className={`inline-block ${className}`}
      style={{ width: size, height: size, display: 'inline-block' }}
      role="status"
    >
      <style>
        {`
          @keyframes dot-ripple {
            0%   { transform: scale(0.28); opacity: 0.5; }
            70%  { opacity: 0; }
            100% { transform: scale(1); opacity: 0; }
          }
          @keyframes dot-core {
            0%, 100% { transform: scale(1); }
            50%      { transform: scale(0.78); }
          }
          .dot-ripple-ring {
            transform-origin: 50px 50px;
            animation: dot-ripple 1.8s ease-out infinite;
          }
          .dot-ripple-ring.r2 { animation-delay: 0.6s; }
          .dot-ripple-ring.r3 { animation-delay: 1.2s; }
          .dot-ripple-core {
            transform-origin: 50px 50px;
            animation: dot-core 1.8s ease-in-out infinite;
          }
        `}
      </style>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle className="dot-ripple-ring" cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="6" />
        <circle className="dot-ripple-ring r2" cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="6" />
        <circle className="dot-ripple-ring r3" cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="6" />
        <circle className="dot-ripple-core" cx="50" cy="50" r="12" fill="currentColor" />
      </svg>
      <span style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: 0 }}>
        Loading...
      </span>
    </div>
  );
}
