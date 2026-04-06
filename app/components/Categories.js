'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Custom minimal SVG icons for specific business types matching user mockups
const defaultIcons = {
  asian: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 21L21 7"></path>
      <path d="M7 17l4-4"></path>
      <path d="M3 21l3.5-3.5"></path>
      <path d="M14 6l4-4"></path>
      <circle cx="10" cy="10" r="3"></circle>
    </svg>
  ),
  japanese: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12c0 2.2-2.5 4.5-5 5.5-2.5 1-6.5 1-9.5-1C4 14 2 12 2 12s2-2 5.5-4.5c3-2 7-2 9.5-1 2.5 1 5 3.5 5 5.5z"></path>
      <path d="M15 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"></path>
      <path d="M22 12l-4-4"></path>
      <path d="M22 12l-4 4"></path>
      <path d="M2 12l4-4"></path>
      <path d="M2 12l4 4"></path>
    </svg>
  ),
  bagel: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2A9.5 9.5 0 0 0 3 10.5c0 2 1.3 4 3 5.5C8 17.5 10 18 12 18s4-.5 6-2c1.7-1.5 3-3.5 3-5.5A9.5 9.5 0 0 0 12 2z"></path>
      <ellipse cx="12" cy="10.5" rx="3" ry="2.5"></ellipse>
      <path d="M5 16s2 3 7 3 7-3 7-3"></path>
    </svg>
  ),
  bakery: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22a9 9 0 0 0 9-9c0-3-1.5-6-4.5-7.5C13.5 4 11 2 11 2c-1 3-3 5-5.5 6.5C3 10 2 12 2 15a9 9 0 0 0 10 7z"></path>
      <path d="M8 14h8"></path>
      <path d="M9 18h6"></path>
    </svg>
  ),
  breakfast: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="12" rx="6" ry="8"></ellipse>
    </svg>
  ),
  caterer: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"></path>
      <line x1="6" y1="17" x2="18" y2="17"></line>
    </svg>
  ),
  truck: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13"></rect>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
      <circle cx="5.5" cy="18.5" r="2.5"></circle>
      <circle cx="18.5" cy="18.5" r="2.5"></circle>
    </svg>
  ),
  chicken: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m14 10 4-4a3.53 3.53 0 0 0-5-5l-4 4"></path>
      <path d="m10 14-4 4a3.53 3.53 0 0 0 5 5l4-4"></path>
      <path d="M12 12m-6 0a6 6 0 1 0 12 0 6 6 0 1 0-12 0"></path>
    </svg>
  ),
  coffee: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
      <line x1="6" y1="1" x2="6" y2="4"></line>
      <line x1="10" y1="1" x2="10" y2="4"></line>
      <line x1="14" y1="1" x2="14" y2="4"></line>
    </svg>
  ),
  delivery: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="17" r="3"></circle>
      <circle cx="17" cy="17" r="3"></circle>
      <line x1="14" y1="17" x2="10" y2="17"></line>
      <polyline points="14 14 17 14 19 11"></polyline>
      <path d="M12 14v-4l-3-3h-4"></path>
      <path d="M5 14v-2"></path>
    </svg>
  ),
  default: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14"></path>
      <path d="M3 9h18"></path>
    </svg>
  )
};

function getCategoryIcon(name) {
  const key = name?.toLowerCase() || '';
  if (key.includes('asian')) return defaultIcons['asian'];
  if (key.includes('japan')) return defaultIcons['japanese'];
  if (key.includes('bagel')) return defaultIcons['bagel'];
  if (key.includes('bakery')) return defaultIcons['bakery'];
  if (key.includes('breakfast')) return defaultIcons['breakfast'];
  if (key.includes('cater') && key.includes('suppl')) return defaultIcons['truck'];
  if (key.includes('cater')) return defaultIcons['caterer'];
  if (key.includes('chicken')) return defaultIcons['chicken'];
  if (key.includes('coffee')) return defaultIcons['coffee'];
  if (key.includes('delivery')) return defaultIcons['delivery'];
  
  return defaultIcons.default;
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  const scrollContainerRef = useRef(null);
  const loadingScrollContainerRef = useRef(null);

  const scrollLeft = (ref) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -344, behavior: 'smooth' });
    }
  };

  const scrollRight = (ref) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 344, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { getRestaurantCategories } = await import('../lib/api');
        const data = await getRestaurantCategories();
        const results = data.results || [];
        setCategories(results.filter(cat => cat.is_active !== false));
      } catch (err) {
        console.error('Error fetching restaurant categories:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="categories-section" id="categories" style={{ padding: '60px 0', background: '#f8f9fa' }}>
        <div className="container">
          <h2 className="section-title">Browse by Category</h2>
          <div 
            style={{ position: 'relative' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button 
              onClick={() => scrollLeft(loadingScrollContainerRef)}
              style={{
                position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%)',
                zIndex: 10, width: '40px', height: '40px', borderRadius: '50%',
                background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                color: '#64748b',
                opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s', pointerEvents: isHovered ? 'auto' : 'none'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div 
              ref={loadingScrollContainerRef}
              style={{ 
                display: 'flex', overflowX: 'auto', gap: '24px', paddingBottom: '8px', 
                scrollbarWidth: 'none', msOverflowStyle: 'none'
              }}
              className="hide-scrollbar"
            >
            {[...Array(6)].map((_, i) => (
              <div key={i} className="category-skeleton-card" style={{ 
                minWidth: '280px',
                height: '180px', 
                borderRadius: '16px', 
                background: '#fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', opacity: 0.5, animation: 'pulse 1.5s infinite' 
              }}>
                <style>{`
                  @media (max-width: 768px) {
                    .category-skeleton-card { min-width: 85% !important; }
                  }
                `}</style>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e0f2fe' }} />
                <span style={{ width: '120px', height: '16px', background: '#e2e8f0', borderRadius: '4px' }} />
              </div>
            ))}
            </div>
            <button 
              onClick={() => scrollRight(loadingScrollContainerRef)}
              style={{
                position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)',
                zIndex: 10, width: '40px', height: '40px', borderRadius: '50%',
                background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                color: '#64748b',
                opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s', pointerEvents: isHovered ? 'auto' : 'none'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="categories-section" id="categories" style={{ background: '#f8f9fa' }}>
      <div className="container">
        <h2 className="section-title">Browse by Category</h2>
        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div 
          style={{ position: 'relative' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button 
            onClick={() => scrollLeft(scrollContainerRef)}
            style={{
              position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%)',
              zIndex: 10, width: '48px', height: '48px', borderRadius: '50%',
              background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              color: '#0ea5e9', transition: 'all 0.2s', opacity: isHovered ? 1 : 0, pointerEvents: isHovered ? 'auto' : 'none'
            }}
            onMouseOver={(e) => { e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'; }}
            onMouseOut={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div 
            ref={scrollContainerRef}
            className="categories-slider-container"
          >
          {categories.map((cat) => {
            const slug = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-');
            const businessCountText = cat.business_count || cat.businesses_count 
              ? `${cat.business_count || cat.businesses_count} businesses`
              : 'Explore businesses';

            return (
              <Link key={cat.id || cat.name} href={`/category/${slug}/nearme.com`} className="category-card-link" style={{ textDecoration: 'none' }}>
                <div 
                  className="category-card-modern" 
                  id={`cat-${slug}`}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '32px 24px',
                    gap: '12px',
                    background: '#fff',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    transition: 'var(--transition-smooth)',
                    cursor: 'pointer',
                    height: '100%',
                    border: '1px solid #f1f5f9'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-premium)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    borderRadius: '50%', 
                    background: 'rgba(14, 165, 233, 0.1)', 
                    color: '#0ea5e9', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px'
                  }}>
                    {getCategoryIcon(cat.name)}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ 
                      color: '#0f172a', 
                      fontWeight: '600', 
                      fontSize: '1.2rem', 
                      margin: '0 0 6px 0',
                      textTransform: 'capitalize'
                    }}>
                      {cat.name}
                    </h3>
                    <p style={{
                      color: '#64748b',
                      fontSize: '0.9rem',
                      margin: 0
                    }}>
                      {businessCountText}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
          </div>
          <button 
            onClick={() => scrollRight(scrollContainerRef)}
            style={{
              position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)',
              zIndex: 10, width: '48px', height: '48px', borderRadius: '50%',
              background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              color: '#0ea5e9', transition: 'all 0.2s', opacity: isHovered ? 1 : 0, pointerEvents: isHovered ? 'auto' : 'none'
            }}
            onMouseOver={(e) => { e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'; }}
            onMouseOut={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
