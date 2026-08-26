'use client';

/**
 * Shared Logo — the same SVG used in the real Header.
 * Import this wherever you need the brand mark (Header, Skeleton headers, etc.)
 */
export default function Logo() {
  return (
    <svg
      width="220"
      height="35"
      viewBox="0 0 240 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="0"
        y="28"
        fontFamily="Inter, sans-serif"
        fontWeight="800"
        fontSize="24"
        fill="#18181b"
        style={{ letterSpacing: '-1px' }}
      >
        doers
      </text>
      <text
        x="72"
        y="28"
        fontFamily="Inter, sans-serif"
        fontWeight="800"
        fontSize="24"
        fill="#ff7e67"
        style={{ letterSpacing: '-0.5px' }}
      >
        marketing
      </text>
      <circle cx="204" cy="24" r="4" fill="#ff7e67" />
    </svg>
  );
}
