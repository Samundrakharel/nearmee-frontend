import React from 'react';

export function LoadingIcon({ size = 40, className = '' }) {
  return (
    <div
      className={`inline-block ${className}`}
      style={{ width: size, height: size, display: 'inline-block' }}
      role="status"
    >
      <style>
        {`
          @keyframes hexagon-dash {
            0% {
              stroke-dashoffset: 300;
            }
            100% {
              stroke-dashoffset: 0;
            }
          }
          .hexagon-animate {
            animation: hexagon-dash 2s linear infinite;
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
        {/* Background hexagon */}
        <path
          d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          opacity="0.2"
        />
        
        {/* Animated hexagon line - snake crawling */}
        <path
          d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="100 200"
          className="hexagon-animate"
        />
      </svg>
      <span style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: 0 }}>
        Loading...
      </span>
    </div>
  );
}
