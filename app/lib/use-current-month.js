'use client';

import { useEffect, useState } from 'react';

function currentMonthLabel() {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * The month and year right now, e.g. "August 2026".
 *
 * Deliberately not derived from any record's own timestamp: the "(updated …)"
 * labels are meant to always read as the current month, whatever the row's
 * updated_at happens to say.
 *
 * Computed once during render so the label is present in the server-rendered
 * HTML, then recomputed on mount from the visitor's own clock. That second
 * pass is what keeps it current if the HTML was cached — a page rendered in
 * June would otherwise keep serving "June 2026" for the life of the cache
 * entry. Call sites should mark the surrounding element suppressHydrationWarning:
 * the server's timezone and the visitor's can straddle a month boundary at the
 * same instant, which React would otherwise report as a text mismatch.
 */
export function useCurrentMonthLabel() {
  const [label, setLabel] = useState(currentMonthLabel);

  useEffect(() => {
    setLabel(currentMonthLabel());
  }, []);

  return label;
}
