'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBusinesses } from '../lib/api';

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

export default function Businesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBusinesses() {
      try {
        const data = await getBusinesses({ page_size: 10 });
        setBusinesses(data.results || []);
      } catch (err) {
        console.error('Error fetching businesses:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBusinesses();
  }, []);

  const getBusinessLink = (biz) => {
    return `/business/${biz.slug || biz.id}/nearme.com`;
  };

  if (loading) {
    return (
      <section className="businesses-section" id="businesses">
        <div className="businesses-header">
          <h2>Top Businesses Near You</h2>
        </div>
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading businesses...</div>
      </section>
    );
  }

  if (businesses.length === 0) {
    return (
      <section className="businesses-section" id="businesses">
        <div className="businesses-header">
          <h2>Top Businesses Near You</h2>
        </div>
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No businesses found.</div>
      </section>
    );
  }

  return (
    <section className="businesses-section" id="businesses">
      <div className="businesses-header">
        <h2>Top Businesses Near You</h2>
        <a href="#" className="view-all-link" id="view-all-link">View All</a>
      </div>
      {businesses.map((biz) => (
        <div key={biz.id} className="business-card" id={`business-${biz.id}`}>
          <div className="business-image">
            {biz.image ? (
              <img src={biz.image} alt={biz.name} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
            )}
          </div>
          <div className="business-info">
            <h3>{biz.name}</h3>
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
            {biz.description && <p className="business-description">{biz.description}</p>}
            <Link href={getBusinessLink(biz)} className="btn-view-business" id={`view-business-${biz.id}`}>
              View Business
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
}
