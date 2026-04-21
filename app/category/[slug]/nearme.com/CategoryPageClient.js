'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { getCategoryBySlug, getBusinessesByCategorySlug } from '../../../lib/api';
import { CategoryResultsSkeleton, BusinessCardSkeleton } from '../../../components/Skeleton';
import HexagonLoader from '../../../components/HexagonLoader';
import '../../category.css';

const ratings = ['4', '3', '2'];
const neighborhoods = ['Downtown', 'Midtown', 'Uptown', 'Suburbs'];

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

export default function CategoryPageClient({
  slug,
  initialCategoryInfo,
  initialBusinesses,
  initialTotalResults,
  initialTotalPages,
}) {
  const [categoryInfo, setCategoryInfo] = useState(initialCategoryInfo);
  const [businesses, setBusinesses] = useState(initialBusinesses || []);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(initialTotalResults || 0);
  const [totalPages, setTotalPages] = useState(initialTotalPages || 1);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState({
    neighborhood: ''
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const isFirstRender = useRef(true);

  // Fetch category info and businesses
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        // Fetch category details
        const catData = await getCategoryBySlug(slug).catch(() => null);
        setCategoryInfo(catData);

        // Fetch businesses for this category with filters
        const bizData = await getBusinessesByCategorySlug(slug, { 
          page: currentPage, 
          rating: activeFilters.rating,
          neighborhood: activeFilters.neighborhood
        });
        setBusinesses(bizData.results || []);
        setTotalResults(bizData.count || 0);
        setTotalPages(bizData.total_pages || 1);
      } catch (err) {
        console.error('Error fetching category data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug, currentPage, activeFilters]);

  const handleApplyFilters = () => {
    setActiveFilters({
      rating: selectedRatings.length > 0 ? selectedRatings[0] : '',
      neighborhood: selectedNeighborhoods.length > 0 ? selectedNeighborhoods[0] : ''
    });
    setCurrentPage(1);
  };

  const toggleRatingFilter = (value) => {
    setSelectedRatings((prev) => (prev.includes(value) ? [] : [value]));
  };

  const rawTitle = categoryInfo?.name || slug.split('-').join(' ');
  const formattedTitle = rawTitle.replace(/\b\w/g, c => c.toUpperCase());

  function toggleFilter(value, selected, setSelected) {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= Math.min(totalPages, 5); i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <Header />
      <div className="category-page">
        {/* Mobile Filter Toggle */}
        <button 
          className="mobile-filter-toggle btn-login"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          style={{
            display: 'none',
            width: '100%',
            marginBottom: '20px',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            height: '48px',
            borderRadius: '12px',
            fontWeight: 600
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
          {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
        </button>

        <style>{`
          @media (max-width: 768px) {
            .mobile-filter-toggle { display: flex !important; }
            .filter-sidebar { 
              display: ${isFilterOpen ? 'block' : 'none'} !important;
              position: relative !important;
              top: 0 !important;
              margin-bottom: 24px;
              width: 100% !important;
              border: 1px solid var(--color-border);
              border-radius: 16px;
              padding: 20px !important;
            }
          }
        `}</style>

        {/* Sidebar Filters */}
        <aside className="filter-sidebar glass" style={{ borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px' }}>Filters</h2>

          <div className="filter-group">
            <h3>Rating</h3>
            {ratings.map((r) => (
              <div
                key={r}
                className={`filter-option ${selectedRatings.includes(r) ? 'active' : ''}`}
                onClick={() => toggleRatingFilter(r)}
              >
                <span className="filter-checkbox" />
                {r}★ &amp; up
              </div>
            ))}
          </div>

          <div className="filter-group">
            <h3>Neighborhood</h3>
            {neighborhoods.map((n) => (
              <div
                key={n}
                className={`filter-option ${selectedNeighborhoods.includes(n) ? 'active' : ''}`}
                onClick={() => toggleFilter(n, selectedNeighborhoods, setSelectedNeighborhoods)}
              >
                <span className="filter-checkbox" />
                {n}
              </div>
            ))}
          </div>

          <button 
            className="btn-apply-filters" 
            id="btn-apply-filters"
            onClick={handleApplyFilters}
          >
            Apply Filters
          </button>
        </aside>

        {/* Main Content */}
        <div className="category-results">
          <div className="category-results-header">
            <h1>{formattedTitle}</h1>
            <span className="results-count">
              {loading ? 'Loading...' : `Showing ${businesses.length} of ${totalResults} results`}
            </span>
          </div>

          {loading && (
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
              <HexagonLoader label="Finding businesses…" />
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[1, 2, 3].map(i => <BusinessCardSkeleton key={i} />)}
            </div>
          ) : businesses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No businesses found in this category.</div>
          ) : (
            <>
              {/* Business Cards */}
              {businesses.map((biz) => (
                <div 
                  key={biz.id} 
                  className="business-card" 
                  id={`business-${biz.id}`}
                  style={{ 
                    borderRadius: '16px', 
                    overflow: 'hidden', 
                    padding: '20px', 
                    display: 'flex', 
                    gap: '20px',
                    transition: 'var(--transition-smooth)',
                    border: '1px solid #f1f5f9'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-premium)';
                    e.currentTarget.style.borderColor = 'var(--color-primary-light)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#f1f5f9';
                  }}
                >
                  <div className="business-image" style={{ borderRadius: '12px' }}>
                    <Link href={`/business/${biz.slug || biz.id}/nearme.com`} style={{ display: 'block', width: '100%', height: '100%' }}>
                      {biz.image ? (
                        <img src={biz.image} alt={biz.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                      )}
                    </Link>
                  </div>
                  <div className="business-info">
                    <Link href={`/business/${biz.slug || biz.id}/nearme.com`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px' }}>{biz.name}</h3>
                    </Link>
                    <div className="business-type" style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.9rem', marginBottom: '8px' }}>{biz.type}</div>
                    <div className="business-rating" style={{ marginBottom: '12px' }}>
                      <StarRating rating={biz.rating} />
                      <span className="rating-number" style={{ fontWeight: 700 }}>{biz.rating}</span>
                      <span className="review-count">({biz.reviews} reviews)</span>
                    </div>
                    <div className="business-address" style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                        <circle cx="12" cy="9" r="2.5" />
                      </svg>
                      {biz.address}
                    </div>
                    <Link href={`/business/${biz.slug || biz.id}/nearme.com`} className="btn-view-business" id={`view-business-${biz.id}`} style={{ borderRadius: '12px', padding: '10px 24px', fontWeight: 600 }}>
                      View Business
                    </Link>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Previous
              </button>
              {pageNumbers.map((num) => (
                <button
                  key={num}
                  className={`pagination-number ${currentPage === num ? 'active' : ''}`}
                  onClick={() => setCurrentPage(num)}
                >
                  {num}
                </button>
              ))}
              {totalPages > 5 && <span className="pagination-ellipsis">•••</span>}
              <button
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
