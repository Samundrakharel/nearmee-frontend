'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import { getCategoryBySlug, getBusinessesByCategorySlug } from '../../lib/api';
import '../category.css';

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

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [categoryName, setCategoryName] = useState('');

  // Fallback title formatting from slug
  const fallbackTitle = slug
    ? slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Category';

  const title = categoryName || fallbackTitle;

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeFilters, setActiveFilters] = useState({
    rating: '',
    neighborhood: ''
  });

  useEffect(() => {
    async function fetchCategoryData() {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        // Fetch category details for the title
        const catData = await getCategoryBySlug(slug).catch(() => null);
        if (catData && catData.name) {
          setCategoryName(catData.name);
        }

        const data = await getBusinessesByCategorySlug(slug, { 
          page: currentPage, 
          rating: activeFilters.rating,
          neighborhood: activeFilters.neighborhood
        });
        setBusinesses(data.results || []);
        if (data.total_pages) setTotalPages(data.total_pages);
      } catch (err) {
        console.error('Failed to fetch businesses for category:', err);
        setError('Failed to load businesses for this category.');
      } finally {
        setLoading(false);
      }
    }
    fetchCategoryData();
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

  function toggleFilter(value, selected, setSelected) {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  return (
    <>
      <Header />
      <div className="category-page">
        {/* Sidebar Filters */}
        <aside className="filter-sidebar">
          <h2>Filter Results</h2>
          
          {/* Note: In a real app with subcategories API, these would be dynamic */}
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
            <h1>{title}</h1>
            <span className="results-count">
              {loading ? '...' : `Showing ${businesses.length} results`}
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '80px', textAlign: 'center', color: '#64748b' }}>Loading businesses...</div>
          ) : error ? (
            <div style={{ padding: '80px', textAlign: 'center', color: '#b91c1c' }}>{error}</div>
          ) : businesses.length === 0 ? (
            <div style={{ padding: '80px', textAlign: 'center', color: '#64748b' }}>
              No businesses found in this category yet.
            </div>
          ) : (
            <>
              {/* Business Cards */}
              {businesses.map((biz) => (
                <div key={biz.id} className="business-card" id={`business-${biz.id}`}>
                  <div className="business-image">
                    <img src={biz.image || biz.coverImage || biz.thumbnail || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80'} alt={biz.name} />
                  </div>
                  <div className="business-info">
                    <h3>{biz.name}</h3>
                    <div className="business-type">{biz.type || title}</div>
                    <div className="business-rating">
                      <StarRating rating={biz.rating || 0} />
                      <span className="rating-number">{biz.rating || '0.0'}</span>
                      <span className="review-count">({biz.reviews || 0} reviews)</span>
                    </div>
                    <div className="business-address">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                        <circle cx="12" cy="9" r="2.5" />
                      </svg>
                      {biz.address || 'Address not listed'}
                    </div>
                    <p className="business-description">{biz.description || 'No description provided.'}</p>
                    <Link href={`/business/${biz.slug || biz.id}/nearme.com`} className="btn-view-business" id={`view-business-${biz.id}`}>
                      View Business
                    </Link>
                  </div>
                </div>
              ))}

              {/* Pagination */}
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
                  
                  {/* Dynamic Page Numbers */}
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

          {/* More Categories */}
          <div className="more-categories">
            <h2>More Categories You May Like</h2>
            <div className="more-categories-tags">
                <Link href={`/category/bakery/nearme.com`} className="more-category-tag">Bakery</Link>
                <Link href={`/category/asian-restaurant/nearme.com`} className="more-category-tag">Asian Restaurant</Link>
                <Link href={`/category/breakfast-restaurant/nearme.com`} className="more-category-tag">Breakfast</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
