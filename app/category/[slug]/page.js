'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../category.css';

// Mock data — will be replaced by API calls
const categoryData = {
  restaurants: {
    title: 'Restaurants',
    subcategories: ['Asian Restaurants', 'Italian Restaurants', 'Seafood Restaurants', 'Mexican Restaurants'],
    relatedCategories: [
      { name: 'Italian Restaurants in Canada', slug: 'restaurants' },
      { name: 'Buffet Restaurants in Canada', slug: 'restaurants' },
      { name: 'Pizza Restaurants in Canada', slug: 'restaurants' },
      { name: 'Fast Food in Canada', slug: 'restaurants' },
      { name: 'Fine Dining in Canada', slug: 'restaurants' },
    ],
    businesses: [
      {
        id: 1,
        name: 'Golden Dragon Asian Cuisine',
        type: 'Asian Restaurant',
        rating: 4.7,
        reviews: 389,
        address: '789 Dundas St W, Toronto, ON M5T 1H4',
        description: 'Authentic Asian fusion cuisine featuring the best of Chinese, Thai, and Vietnamese flavors. Our chefs bring decades of experience creating memorable dining experiences.',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
      },
      {
        id: 2,
        name: 'Mama Mia Italian Kitchen',
        type: 'Italian Restaurant',
        rating: 4.6,
        reviews: 512,
        address: '456 Robson St, Vancouver, BC V6B 2B5',
        description: 'Traditional Italian recipes passed down through generations. Homemade pasta, wood-fired pizzas, and an extensive wine selection.',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80',
      },
      {
        id: 3,
        name: 'Sakura Sushi Bar',
        type: 'Japanese Restaurant',
        rating: 4.8,
        reviews: 276,
        address: '123 Queen St E, Toronto, ON M5C 1S2',
        description: 'Premium Japanese sushi and sashimi prepared by award-winning chefs. Fresh fish flown in daily from Tsukiji Market in Tokyo.',
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80',
      },
      {
        id: 4,
        name: 'El Fuego Mexican Grill',
        type: 'Mexican Restaurant',
        rating: 4.4,
        reviews: 198,
        address: '321 King St W, Toronto, ON M5V 1J5',
        description: 'Authentic Mexican street food with a modern twist. Our tacos, burritos, and enchiladas are made with fresh, locally sourced ingredients.',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
      },
    ],
  },
  plumbers: {
    title: 'Plumbers',
    subcategories: ['Emergency Plumbers', 'Commercial Plumbers', 'Residential Plumbers', 'Drain Specialists'],
    relatedCategories: [
      { name: 'Emergency Plumbers in Canada', slug: 'plumbers' },
      { name: 'Commercial Plumbing Services', slug: 'plumbers' },
      { name: 'Bathroom Renovation Plumbers', slug: 'plumbers' },
    ],
    businesses: [
      {
        id: 5,
        name: 'QuickFix Plumbing Services',
        type: 'Emergency Plumber',
        rating: 4.9,
        reviews: 312,
        address: '890 Main St, Vancouver, BC V6A 2V6',
        description: '24/7 emergency plumbing services. Licensed and insured professionals with over 20 years of experience serving the greater Vancouver area.',
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80',
      },
      {
        id: 6,
        name: 'Pro Drain Solutions',
        type: 'Drain Specialist',
        rating: 4.7,
        reviews: 189,
        address: '456 Industrial Ave, Toronto, ON M4G 1Z6',
        description: 'Specializing in drain cleaning, sewer repair, and waterline installation. State-of-the-art camera inspection technology for accurate diagnostics.',
        image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&q=80',
      },
    ],
  },
};

// Generate default category data for categories not explicitly defined
function getCategoryInfo(slug) {
  if (categoryData[slug]) return categoryData[slug];

  const formattedName = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    title: formattedName,
    subcategories: [`${formattedName} Type A`, `${formattedName} Type B`, `${formattedName} Type C`],
    relatedCategories: [
      { name: `Top ${formattedName} in Canada`, slug },
      { name: `${formattedName} Near Me`, slug },
      { name: `Best ${formattedName} 2026`, slug },
    ],
    businesses: [
      {
        id: 101,
        name: `Premier ${formattedName} Services`,
        type: formattedName,
        rating: 4.6,
        reviews: 234,
        address: '100 Business Ave, Toronto, ON M5H 2N2',
        description: `Top-rated ${formattedName.toLowerCase()} service provider. Trusted by thousands of customers across Canada for exceptional quality and reliable service.`,
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
      },
      {
        id: 102,
        name: `Elite ${formattedName} Co.`,
        type: formattedName,
        rating: 4.4,
        reviews: 178,
        address: '250 Commerce Dr, Vancouver, BC V6B 1T8',
        description: `Professional ${formattedName.toLowerCase()} services with years of expertise. Customer satisfaction guaranteed with competitive pricing and fast turnaround.`,
        image: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=400&q=80',
      },
    ],
  };
}

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
  const info = getCategoryInfo(slug);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

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

          <div className="filter-group">
            <h3>Category</h3>
            {info.subcategories.map((sub) => (
              <div
                key={sub}
                className={`filter-option ${selectedCategories.includes(sub) ? 'active' : ''}`}
                onClick={() => toggleFilter(sub, selectedCategories, setSelectedCategories)}
              >
                <span className="filter-checkbox" />
                {sub}
              </div>
            ))}
          </div>

          <div className="filter-group">
            <h3>Rating</h3>
            {ratings.map((r) => (
              <div
                key={r}
                className={`filter-option ${selectedRatings.includes(r) ? 'active' : ''}`}
                onClick={() => toggleFilter(r, selectedRatings, setSelectedRatings)}
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

          <button className="btn-apply-filters" id="btn-apply-filters">
            Apply Filters
          </button>
        </aside>

        {/* Main Content */}
        <div className="category-results">
          <div className="category-results-header">
            <h1>{info.title}</h1>
            <span className="results-count">
              Showing {info.businesses.length} results
            </span>
          </div>

          {/* Business Cards */}
          {info.businesses.map((biz) => (
            <div key={biz.id} className="business-card" id={`business-${biz.id}`}>
              <div className="business-image">
                <img src={biz.image} alt={biz.name} />
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
                <button className="btn-view-business" id={`view-business-${biz.id}`}>
                  View Business
                </button>
              </div>
            </div>
          ))}

          {/* Pagination */}
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
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                className={`pagination-number ${currentPage === num ? 'active' : ''}`}
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </button>
            ))}
            <span className="pagination-ellipsis">•••</span>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* More Categories */}
          <div className="more-categories">
            <h2>More Categories You May Like</h2>
            <div className="more-categories-tags">
              {info.relatedCategories.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/category/${cat.slug}`}
                  className="more-category-tag"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
