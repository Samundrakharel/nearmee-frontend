'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getTopBusinessesByCategory } from '../lib/api';
import { useLocation } from '../context/LocationContext';
import { BusinessCardSkeleton } from './Skeleton';

function StarRating({ rating }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<span key={i} className="star">★</span>);
    } else if (i - rating < 1 && i - rating > 0) {
      stars.push(<span key={i} className="star half">★</span>);
    } else {
      stars.push(<span key={i} className="star empty">★</span>);
    }
  }
  return <div className="stars">{stars}</div>;
}

export default function Businesses({ initialCategorizedBusinesses }) {
  const [categorizedBusinesses, setCategorizedBusinesses] = useState(initialCategorizedBusinesses || []);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const searchKeyword = searchParams.get('search') || '';

  const { lat, lng, address, loading: locationLoading } = useLocation();

  const isFirstRender = useRef(true);

  // Fetch businesses whenever location changes
  useEffect(() => {
    // Wait for location to resolve (or be denied)
    if (locationLoading) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Note: we don't return here if lat/lng are present because we MIGHT want to
      // load location-specific businesses. But initial is fine to show.
    }

    async function fetchBusinesses() {
      // Don't show loading on first load if we have data, but do afterwards
      if (!isFirstRender.current) {
        setLoading(true);
      }
      try {
        const params = {};
        if (searchKeyword) {
          params.search = searchKeyword;
        }
        if (lat && lng) {
          params.lat = lat;
          params.long = lng; // API expects 'long'
        }
        const data = await getTopBusinessesByCategory(params);
        setCategorizedBusinesses(data);
      } catch (err) {
        console.error('Error fetching businesses:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBusinesses();
  }, [lat, lng, locationLoading, searchKeyword]);

  const getBusinessLink = (biz) => {
    return `/business/${biz.slug || biz.id}/nearme.com`;
  };

  // Prioritize categories that have businesses
  const prioritizedCategories = categorizedBusinesses.filter(
    (group) => group.businesses && group.businesses.length > 0
  );

  return (
    <section className="businesses-section" id="businesses">
      <div className="container">
        <div className="businesses-header">
          <h2>Top Businesses Near You</h2>
        </div>

        {/* Loading state */}
        {(loading || locationLoading) && (
          <div className="businesses-loading">
            {[1, 2, 3].map(i => (
              <BusinessCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !locationLoading && prioritizedCategories.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            No top businesses found{address ? ` near ${address}` : ''}.
          </div>
        )}

        {/* Categorized Business Sections */}
        {!loading && !locationLoading && prioritizedCategories.map((group) => (
          <div key={group.category.id} className="category-businesses-group" style={{ marginBottom: '40px' }}>
            <div className="businesses-header" style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b' }}>
                {group.category.name}
              </h3>
              {group.businesses.length > 0 && (
                <Link href={`/category/${group.category.slug}`} className="view-all-link">
                  View All
                </Link>
              )}
            </div>
            
            <div className="business-cards-list">
              {group.businesses.slice(0, 5).map((biz) => (
                <div key={biz.id} className="business-card" id={`business-${biz.id}`}>
                  <div className="business-image">
                    <Link href={getBusinessLink(biz)} style={{ display: 'block', width: '100%', height: '100%' }}>
                      {biz.image ? (
                        <img src={biz.image} alt={biz.name} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      )}
                    </Link>
                  </div>
                  <div className="business-info">
                    <Link href={getBusinessLink(biz)} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h3>{biz.name}</h3>
                    </Link>
                    {biz.type && <div className="business-type">{biz.type}</div>}
                    {biz.rating > 0 && (
                      <div className="business-rating">
                        <StarRating rating={biz.rating} />
                        <span className="rating-number">{biz.rating}</span>
                        {biz.reviews > 0 && <span className="review-count">({biz.reviews} reviews)</span>}
                      </div>
                    )}
                    {biz.address && (
                      <div className="business-address">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                          <circle cx="12" cy="9" r="2.5" />
                        </svg>
                        {biz.address}
                      </div>
                    )}
                    {biz.description && <p className="business-description">{biz.description.substring(0, 100)}{biz.description.length > 100 ? '...' : ''}</p>}
                    <Link href={getBusinessLink(biz)} className="btn-view-business" id={`view-business-${biz.id}`}>
                      View Business
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
