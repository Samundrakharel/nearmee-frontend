'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { getCategoryBySlug, getBusinessesByCategorySlug } from '../../../lib/api';
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

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug;

  const [categoryInfo, setCategoryInfo] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState({
    rating: '',
    neighborhood: ''
  });

  // Fetch category info and businesses
  useEffect(() => {
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

  const formattedTitle = categoryInfo?.name || slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

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
        {/* Sidebar Filters */}
        <aside className="filter-sidebar">
          <h2>Filter Results</h2>

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

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading businesses...</div>
          ) : businesses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No businesses found in this category.</div>
          ) : (
            <>
              {/* Business Cards */}
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
                    <div className="business-type">{biz.type}</div>
                    <div className="business-rating">
                      <StarRating rating={biz.rating} />
                      <span className="rating-number">{biz.rating}</span>
                      <span className="review-count">({biz.reviews} reviews)</span>
                    </div>
                    <div className="business-address">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                        <circle cx="12" cy="9" r="2.5" />
                      </svg>
                      {biz.address}
                    </div>
                    <p className="business-description">{biz.description}</p>
                    <Link href={`/business/${biz.slug || biz.id}/nearme.com`} className="btn-view-business" id={`view-business-${biz.id}`}>
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
