'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBusinesses } from '../lib/api';

// Default SVG icons for common business types
const defaultIcons = {
  restaurants: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/>
      <path d="M7 2v20"/>
      <path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
    </svg>
  ),
  plumbers: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  'auto-services': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2M5 17v2m14-2v2"/>
      <circle cx="7.5" cy="14" r="1.5"/>
      <circle cx="16.5" cy="14" r="1.5"/>
    </svg>
  ),
  hotels: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V7a2 2 0 012-2h6v16"/>
      <path d="M11 7h8a2 2 0 012 2v12"/>
      <path d="M3 21h18"/>
      <path d="M7 9h2m-2 4h2m4-4h2m-2 4h2m-2 4h2"/>
    </svg>
  ),
  doctors: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
  lawyers: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17M12 3l11 6-11 6L1 9l11-6z"/>
    </svg>
  ),
  salons: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3"/>
      <line x1="4" y1="21" x2="20" y2="21"/>
      <line x1="12" y1="16" x2="12" y2="21"/>
    </svg>
  ),
  gyms: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5l11 11"/>
      <path d="M21 3l-5.5 5.5"/>
      <path d="M3 21l5.5-5.5"/>
      <path d="M18.5 5.5L21 3"/>
      <path d="M5.5 18.5L3 21"/>
      <path d="M14 4l6 6"/>
      <path d="M4 14l6 6"/>
    </svg>
  ),
  'real-estate': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18"/>
      <path d="M5 21V7l8-4v18"/>
      <path d="M19 21V11l-6-4"/>
      <path d="M9 9h1m-1 4h1m4-4h1m-1 4h1"/>
    </svg>
  ),
  'financial-services': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  ),
  default: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18"/>
      <path d="M5 21V7l8-4v18"/>
      <path d="M19 21V11l-6-4"/>
      <path d="M9 9h1m-1 4h1m4-4h1m-1 4h1"/>
    </svg>
  ),
};

function getCategoryIcon(name) {
  const key = name?.toLowerCase() || '';
  if (key.includes('restaurant') || key.includes('food')) return defaultIcons['restaurants'];
  if (key.includes('plumb')) return defaultIcons['plumbers'];
  if (key.includes('auto') || key.includes('car')) return defaultIcons['auto-services'];
  if (key.includes('hotel') || key.includes('stay')) return defaultIcons['hotels'];
  if (key.includes('doctor') || key.includes('clinic') || key.includes('medical')) return defaultIcons['doctors'];
  if (key.includes('lawyer') || key.includes('legal')) return defaultIcons['lawyers'];
  if (key.includes('salon') || key.includes('spa') || key.includes('barber')) return defaultIcons['salons'];
  if (key.includes('gym') || key.includes('fitness') || key.includes('health')) return defaultIcons['gyms'];
  if (key.includes('real estate') || key.includes('property')) return defaultIcons['real-estate'];
  if (key.includes('finance') || key.includes('bank') || key.includes('financial')) return defaultIcons['financial-services'];
  
  return null;
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { getBusinessTypes } = await import('../lib/api');
        const data = await getBusinessTypes();
        const results = data.results || [];
        setCategories(results.filter(cat => cat.is_active !== false));
      } catch (err) {
        console.error('Error fetching business types:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="categories-section" id="categories">
        <h2 className="section-title">Browse by Category</h2>
        <div className="categories-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="category-card" style={{ opacity: 0.5, animation: 'pulse 1.5s infinite' }}>
              <div className="category-icon" style={{ width: 28, height: 28, background: '#e2e8f0', borderRadius: '50%' }} />
              <span style={{ width: 60, height: 14, background: '#e2e8f0', borderRadius: 4, display: 'inline-block' }} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="categories-section" id="categories">
      <h2 className="section-title">Browse by Category</h2>
      <div className="categories-grid">
        {categories.map((cat) => {
          const slug = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-');
          return (
            <Link key={cat.id || cat.name} href={`/category/${slug}/nearme.com`} style={{ textDecoration: 'none' }}>
              <div className="category-card" id={`cat-${slug}`}>
                <div className="category-icon">
                  {getCategoryIcon(cat.name) || (cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('/')) ? (
                    <img src={cat.icon} alt={cat.name} style={{ width: 28, height: 28, objectFit: 'contain' }} />
                  ) : (
                    defaultIcons.default
                  ))}
                </div>
                <span>{cat.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
