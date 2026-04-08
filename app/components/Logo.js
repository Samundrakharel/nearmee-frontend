'use client';

/**
 * Shared Logo — the same SVG used in the real Header.
 * Import this wherever you need the brand mark (Header, Skeleton headers, etc.)
 */
export default function Logo() {
  return (
    <svg
      width="100"
      height="35"
      viewBox="0 0 110 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="0"
        y="28"
        fontFamily="Inter, sans-serif"
        fontWeight="800"
        fontSize="24"
        fill="#3B82F6"
        style={{ letterSpacing: '-1px' }}
      >
        near
      </text>
      <circle cx="75" cy="20" r="18" fill="#3B82F6" />
      <text
        x="60"
        y="28"
        fontFamily="Inter, sans-serif"
        fontWeight="800"
        fontSize="24"
        fill="white"
        style={{ letterSpacing: '-1px' }}
      >
        me
      </text>
    </svg>
  );
}
