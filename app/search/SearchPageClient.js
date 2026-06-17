'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import { getBusinesses, getBusinessSubdomainUrl } from '../lib/api';
import { BusinessCardSkeleton } from '../components/Skeleton';
import { HexagonOverlay } from '../components/HexagonLoader';
import '../category/category.css';

const RATINGS = ['4', '3', '2'];

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

export default function SearchPageClient({
  initialQuery,
  initialBusinesses,
  initialTotalPages,
  initialCount,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [businesses, setBusinesses] = useState(initialBusinesses || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(initialCount || 0);
  const [totalPages, setTotalPages] = useState(initialTotalPages || 1);
  const [currentPage, setCurrentPage] = useState(1);

  const [inputQuery, setInputQuery] = useState(initialQuery || '');
  const [activeQuery, setActiveQuery] = useState(initialQuery || '');

  const [selectedRating, setSelectedRating] = useState('');
  const [appliedRating, setAppliedRating] = useState('');

  const isFirstRender = useRef(true);

  const fetchResults = useCallback(async (query, page, minRating) => {
    if (!query.trim()) {
      setBusinesses([]);
      setCount(0);
      setTotalPages(1);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = { search: query.trim(), page_size: 20, page };
      if (minRating) params.min_rating = minRating;
      const data = await getBusinesses(params);
      setBusinesses(data.results || []);
      setCount(data.count || 0);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to load results. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch whenever query, page, or filter changes (skip very first render — SSR data is fresh)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchResults(activeQuery, currentPage, appliedRating);
  }, [activeQuery, currentPage, appliedRating, fetchResults]);

  // Sync query from URL when the browser navigates back/forward
  useEffect(() => {
    const urlQ = searchParams.get('q') || '';
    if (urlQ !== activeQuery) {
      setActiveQuery(urlQ);
      setInputQuery(urlQ);
      setCurrentPage(1);
    }
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    setCurrentPage(1);
    setActiveQuery(inputQuery.trim());
    router.push(`/search?q=${encodeURIComponent(inputQuery.trim())}`, { scroll: false });
  };

  const handleApplyFilters = () => {
    setAppliedRating(selectedRating);
    setCurrentPage(1);
  };

  const hasQuery = activeQuery.trim().length > 0;

  return (
    <>
      <Header />

      {/* Search bar */}
      <div style={{
        background: 'var(--color-bg-white)',
        borderBottom: '1px solid var(--color-border)',
        padding: '20px 24px',
      }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', maxWidth: '600px' }}>
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Search businesses, categories..."
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: '1rem',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                color: 'var(--color-text-dark)',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#fff',
                background: 'var(--color-primary)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="category-page">
        {/* Sidebar */}
        <aside className="filter-sidebar">
          <h2>Filter Results</h2>

          <div className="filter-group">
            <h3>Min Rating</h3>
            {RATINGS.map((r) => (
              <div
                key={r}
                className={`filter-option ${selectedRating === r ? 'active' : ''}`}
                onClick={() => setSelectedRating((prev) => (prev === r ? '' : r))}
              >
                <span className="filter-checkbox" />
                {r}★ &amp; up
              </div>
            ))}
          </div>

          <button className="btn-apply-filters" onClick={handleApplyFilters}>
            Apply Filters
          </button>

          {appliedRating && (
            <button
              onClick={() => { setSelectedRating(''); setAppliedRating(''); setCurrentPage(1); }}
              style={{
                marginTop: '10px',
                width: '100%',
                padding: '10px',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: 'var(--color-text-medium)',
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
              }}
            >
              Clear Filters
            </button>
          )}
        </aside>

        {/* Results */}
        <div className="category-results">
          <div className="category-results-header">
            <h1>
              {hasQuery ? `Results for "${activeQuery}"` : 'Search Businesses'}
            </h1>
            {hasQuery && !loading && (
              <span className="results-count">
                {count} {count === 1 ? 'business' : 'businesses'} found
              </span>
            )}
          </div>

          {loading && <HexagonOverlay label="Searching…" />}

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[1, 2, 3].map((i) => <BusinessCardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <div style={{ padding: '80px', textAlign: 'center', color: '#b91c1c' }}>{error}</div>
          ) : !hasQuery ? (
            <div style={{ padding: '80px 0', textAlign: 'center', color: '#64748b' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>What are you looking for?</p>
              <p style={{ fontSize: '0.95rem' }}>Enter a business name or category above to get started.</p>
            </div>
          ) : businesses.length === 0 ? (
            <div style={{ padding: '80px 0', textAlign: 'center', color: '#64748b' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>No results found for "{activeQuery}"</p>
              <p style={{ fontSize: '0.95rem' }}>Try a different name, category, or remove filters.</p>
            </div>
          ) : (
            <>
              {businesses.map((biz) => (
                <div key={biz.id} className="business-card" id={`business-${biz.id}`}>
                  <div className="business-image">
                    <Link href={getBusinessSubdomainUrl(biz.slug || biz.id)} style={{ display: 'block', width: '100%', height: '100%' }}>
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
                    <Link href={getBusinessSubdomainUrl(biz.slug || biz.id)} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h3 className="text-h4 fw-bold">{biz.name}</h3>
                    </Link>
                    {biz.type && <div className="business-type text-small fw-medium">{biz.type}</div>}
                    {(biz.rating > 0) && (
                      <div className="business-rating">
                        <StarRating rating={biz.rating} />
                        <span className="rating-number text-small fw-semibold">{biz.rating}</span>
                        {biz.reviews > 0 && (
                          <span className="review-count text-small">({biz.reviews} reviews)</span>
                        )}
                      </div>
                    )}
                    {biz.address && (
                      <div className="business-address text-small">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                          <circle cx="12" cy="9" r="2.5" />
                        </svg>
                        {biz.address}
                      </div>
                    )}
                    {biz.description && (
                      <p className="business-description text-body">
                        {biz.description.substring(0, 120)}{biz.description.length > 120 ? '...' : ''}
                      </p>
                    )}
                    <Link
                      href={getBusinessSubdomainUrl(biz.slug || biz.id)}
                      className="btn-view-business text-small fw-semibold"
                    >
                      View Business
                    </Link>
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Previous
                  </button>

                  {[...Array(totalPages)].map((_, i) => {
                    const num = i + 1;
                    if (num === 1 || num === totalPages || (num >= currentPage - 1 && num <= currentPage + 1)) {
                      return (
                        <button
                          key={num}
                          className={`pagination-number ${currentPage === num ? 'active' : ''}`}
                          onClick={() => setCurrentPage(num)}
                        >
                          {num}
                        </button>
                      );
                    } else if (num === 2 && currentPage > 3) {
                      return <span key="start-ellipsis" className="pagination-ellipsis">•••</span>;
                    } else if (num === totalPages - 1 && currentPage < totalPages - 2) {
                      return <span key="end-ellipsis" className="pagination-ellipsis">•••</span>;
                    }
                    return null;
                  })}

                  <button
                    className="pagination-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
