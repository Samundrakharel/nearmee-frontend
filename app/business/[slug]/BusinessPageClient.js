'use client';

import { useState } from 'react';
import DoersBusinessPage from '../../components/DoersBusinessPage';
import { BusinessDetailSkeleton } from '../../components/Skeleton';

export default function BusinessPageClient({ slug, initialBusiness }) {
  const [business] = useState(initialBusiness);
  const [loading] = useState(false);

  if (loading) return <BusinessDetailSkeleton />;
  if (!business) return <div className="error" style={{ padding: '100px', textAlign: 'center' }}>Business not found</div>;

  return <DoersBusinessPage business={business} />;
}
