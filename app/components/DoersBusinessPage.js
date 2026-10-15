'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// `page` picks which of the microsite's sections this URL renders on its own:
// 'home' is the full single-page site, 'about' and 'contact' are the standalone
// pages served at <business>.doersmarketing.com/about and /contact.
export default function DoersBusinessPage({ business, page = 'home' }) {
  const [activeNav, setActiveNav] = useState(page === 'home' ? 'home' : page);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname() || '/';

  // Links have to work both on a business subdomain (/about) and on the main
  // domain's rewrite target (/business/<slug>/about), so strip the page segment
  // off the current path and rebuild from whatever prefix is left.
  const isHome = page === 'home';
  const basePath = pathname.replace(/\/(about|contact|menu|reviews)\/?$/, '').replace(/\/$/, '');
  const hrefFor = (id) => {
    if (id === 'home') return basePath || '/';
    if (id === 'services') return `${basePath}/#services`;
    return `${basePath}/${id}`;
  };

  const bizName = business.name || 'Le Barbier Sam';
  const shortName = bizName.split('|')[0].trim();
  const address = business.address || '141C Bd Gréber, Gatineau, Quebec J8T 3R1';
  const phone = business.phone || '(819) 775-1049';
  const aboutText = business.about || business.aboutUs || business.description || `At ${shortName}, we set the standard for modern services in ${address.split(',').slice(-2).join(',').trim()}. Trusted by clients searching for reliable professionals, we combine skill, passion, and attention to detail in everything we do.\n\nWhether you're a regular or visiting for the first time, we deliver a premium experience every single time.`;
  const services = business.services?.length ? business.services : ['HAIR CUT', 'HAIR STYLE', 'FADE UP', 'BEARD', 'BEARD COLOR'];
  const categories = business.categories || [];
  const rating = business.rating || 4.7;
  // business.reviews is the {summary, list} object from transformBusiness, not
  // an array — the count comes from totalReviews.
  const reviewsList = business.reviews?.list || [];
  const reviewCount = business.totalReviews || reviewsList.length || 0;
  const reviewsSummary = business.reviewsSummary || '';
  const heroImage = business.coverImage || business.thumbnail || null;
  const type = business.type || '';
  const priceRange = business.priceRange || '';

  // The home page only teases the first paragraph of the About text; the
  // standalone /about page shows all of it plus the extra sections below.
  const aboutParagraphs = aboutText.split(/\n\s*\n/).filter(Boolean);
  const aboutPreview = aboutParagraphs[0] || aboutText;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setActiveNav(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const featureCards = [
    { label: 'Premium', title: 'QUALITY', subtitle: 'EXPERT CARE • TOP RATED' },
    { label: 'Trusted', title: 'SERVICE', subtitle: 'RELIABLE • PROFESSIONAL' },
    { label: 'Local', title: 'COMMUNITY', subtitle: `SERVING ${address.split(',').slice(-2, -1)[0]?.trim()?.toUpperCase() || 'YOUR AREA'}` },
  ];

  // business.hours comes back keyed by day code (Mon..Sun) -> {open, close} in
  // 24h "HH:MM" strings; fall back to a placeholder week when none is set.
  const dayFullNames = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
  const formatHourTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    let hrs = parseInt(h, 10);
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    hrs = hrs % 12 || 12;
    return `${hrs}:${m} ${ampm}`;
  };
  const rawHours = business.hours && typeof business.hours === 'object' ? business.hours : {};
  const businessHours = Object.keys(rawHours).length > 0
    ? Object.keys(dayFullNames).filter((code) => rawHours[code]).map((code) => {
      const d = rawHours[code];
      const hoursText = (d.open && d.close)
        ? `${formatHourTime(d.open)} – ${formatHourTime(d.close)}`
        : ((d.closed || d.isClosed) ? 'Closed' : 'N/A');
      return { day: dayFullNames[code], hours: hoursText };
    })
    : [
      { day: 'Monday', hours: '8:00 AM – 8:00 PM' },
      { day: 'Tuesday', hours: '8:00 AM – 9:00 PM' },
      { day: 'Wednesday', hours: '8:00 AM – 9:00 PM' },
      { day: 'Thursday', hours: '9:00 AM – 9:00 PM' },
      { day: 'Friday', hours: '9:00 AM – 9:00 PM' },
      { day: 'Saturday', hours: '9:00 AM – 7:00 PM' },
      { day: 'Sunday', hours: 'Closed' },
    ];

  // Headline numbers for the standalone About page. Built from the raw fields
  // (not the placeholder fallbacks above) so a business never shows made-up stats.
  const openDays = businessHours.filter((d) => !/closed|n\/a/i.test(d.hours)).length;
  const aboutStats = [
    business.rating > 0 && { label: 'Rating', value: `${Number(business.rating).toFixed(1)}★` },
    reviewCount > 0 && { label: 'Reviews', value: reviewCount },
    Object.keys(rawHours).length > 0 && openDays > 0 && { label: 'Days Open', value: openDays },
    priceRange && { label: 'Price Range', value: priceRange },
  ].filter(Boolean);

  // Amenity/feature groups (offerings, accessibility, atmosphere, ...) shown
  // only on the standalone About page.
  const extensions = business.extensions || {};
  const amenityKeys = Object.keys(extensions).filter((k) => Array.isArray(extensions[k]) && extensions[k].length > 0);
  const preferredAmenityKeys = ['offerings', 'accessibility', 'atmosphere'];
  const amenitySections = (preferredAmenityKeys.filter((k) => amenityKeys.includes(k)).length > 0
    ? preferredAmenityKeys.filter((k) => amenityKeys.includes(k))
    : amenityKeys.slice(0, 3)
  ).map((key) => ({
    key,
    label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
    items: extensions[key],
  }));

  // Reviews: the home page shows the summary plus a few reviews, /reviews shows
  // every review on file. Average comes from the business's real rating, falling
  // back to the loaded reviews — never the placeholder rating above.
  const ratedReviews = reviewsList.filter((r) => r.rating >= 1 && r.rating <= 5);
  const avgRating = Number(business.rating) > 0
    ? Number(business.rating)
    : (ratedReviews.length ? ratedReviews.reduce((s, r) => s + Number(r.rating), 0) / ratedReviews.length : 0);
  const topReviews = reviewsList.slice(0, 3);
  const hasReviewContent = reviewsList.length > 0 || !!reviewsSummary;
  const starCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: ratedReviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const renderStars = (value) => {
    const filled = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
    return '★'.repeat(filled) + '☆'.repeat(5 - filled);
  };
  const renderReviewCard = (review, idx, full) => (
    <article key={review.id || idx} className="dbp-rv-card">
      <div className="dbp-rv-card-head">
        <div className="dbp-rv-avatar">{review.initials || 'A'}</div>
        <div>
          <div className="dbp-rv-author">{review.user}</div>
          {review.date && <div className="dbp-rv-date">{review.date}</div>}
        </div>
      </div>
      <div className="dbp-rv-stars" aria-label={`${review.rating} out of 5 stars`}>{renderStars(review.rating)}</div>
      {review.comment && (
        <p className={`dbp-rv-comment ${full ? '' : 'dbp-rv-clamp'}`}>{review.comment}</p>
      )}
    </article>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700;800&display=swap');

        .dbp-root {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #18181b;
          background: #ffffff;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ─── HEADER ─── */
        .dbp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 48px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255, 126, 103, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dbp-header.scrolled {
          padding: 12px 48px;
          box-shadow: 0 4px 30px rgba(255, 126, 103, 0.08);
        }
        .dbp-header-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .dbp-header-logo {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #ff7e67, #e0533c);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: #fff;
          font-size: 1rem;
          letter-spacing: -0.02em;
        }
        .dbp-header-name {
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: #18181b;
        }
        .dbp-nav { display: flex; gap: 8px; align-items: center; }
        .dbp-nav-btn {
          background: none;
          border: none;
          font-size: 0.9rem;
          font-weight: 500;
          color: #71717a;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.25s ease;
          font-family: inherit;
          text-decoration: none;
          display: inline-block;
          line-height: 1.4;
        }
        .dbp-nav-btn:hover { background: #fff5f2; color: #ff7e67; }
        .dbp-nav-btn.active { background: #ff7e67; color: #ffffff; font-weight: 600; }

        /* ─── HERO ─── */
        .dbp-hero {
          position: relative;
          background: linear-gradient(135deg, #18181b 0%, #27272a 40%, #3f3f46 100%);
          padding: 100px 24px 90px;
          text-align: center;
          overflow: hidden;
        }
        .dbp-hero-image {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          z-index: 0;
        }
        .dbp-hero-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(24, 24, 27, 0.82) 0%, rgba(39, 39, 42, 0.78) 40%, rgba(63, 63, 70, 0.75) 100%);
          z-index: 1;
        }
        .dbp-hero::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -25%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255, 126, 103, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .dbp-hero::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -15%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(255, 158, 141, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .dbp-hero-inner { position: relative; z-index: 2; }
        .dbp-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 126, 103, 0.15);
          border: 1px solid rgba(255, 126, 103, 0.25);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #ff9e8d;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 28px;
          backdrop-filter: blur(8px);
        }
        .dbp-hero-badge-dot {
          width: 6px; height: 6px;
          background: #ff7e67;
          border-radius: 50%;
          animation: dbp-pulse 2s ease-in-out infinite;
        }
        @keyframes dbp-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
        .dbp-hero h1 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(2.8rem, 6vw, 4.8rem);
          font-weight: 700;
          margin: 0 0 20px 0;
          color: #ffffff;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .dbp-hero-address {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 1.05rem;
          color: rgba(255, 255, 255, 0.65);
          margin-bottom: 12px;
        }
        .dbp-hero-rating {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 0.82rem;
          font-weight: 500;
          color: rgba(255,255,255,0.7);
          margin-bottom: 40px;
        }
        .dbp-hero-rating-stars { color: #ff7e67; font-size: 0.75rem; letter-spacing: 1px; }
        .dbp-hero-rating-score { color: #ffffff; font-weight: 700; }
        .dbp-hero-rating-count { color: rgba(255,255,255,0.45); font-weight: 400; }
        .dbp-hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #ff7e67, #e0533c);
          color: #ffffff;
          border: none;
          padding: 12px 28px;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 10px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 32px rgba(255, 126, 103, 0.3);
          font-family: inherit;
        }
        .dbp-hero-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(255, 126, 103, 0.45);
        }

        /* ─── FEATURES GRID ─── */
        .dbp-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          background: #fff5f2;
        }
        .dbp-feature-card {
          padding: 56px 32px;
          text-align: center;
          position: relative;
          transition: all 0.4s ease;
          cursor: default;
          overflow: hidden;
        }
        .dbp-feature-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255, 126, 103, 0.04) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .dbp-feature-card:hover::before { opacity: 1; }
        .dbp-feature-card:nth-child(2) {
          background: #18181b;
        }
        .dbp-feature-card + .dbp-feature-card {
          border-left: 1px solid rgba(255, 126, 103, 0.12);
        }
        .dbp-feature-card:nth-child(2) + .dbp-feature-card {
          border-left: 1px solid rgba(255, 126, 103, 0.08);
        }
        .dbp-feature-label {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 1.6rem;
          color: #ff7e67;
          margin-bottom: 8px;
        }
        .dbp-feature-title {
          font-size: 1.3rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          margin-bottom: 12px;
          color: #18181b;
        }
        .dbp-feature-card:nth-child(2) .dbp-feature-title { color: #ffffff; }
        .dbp-feature-sub {
          font-size: 0.78rem;
          color: #71717a;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .dbp-feature-card:nth-child(2) .dbp-feature-sub { color: rgba(255,255,255,0.45); }

        /* ─── ABOUT ─── */
        .dbp-about {
          padding: 100px 24px;
          background: linear-gradient(180deg, #18181b 0%, #27272a 100%);
          text-align: center;
        }
        .dbp-about-inner { max-width: 780px; margin: 0 auto; }
        .dbp-about-eyebrow {
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #ff7e67;
          margin-bottom: 20px;
        }
        .dbp-about h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 36px 0;
          line-height: 1.2;
        }
        .dbp-about p {
          font-size: 1.05rem;
          line-height: 1.9;
          color: rgba(255, 255, 255, 0.7);
          white-space: pre-line;
          font-weight: 300;
        }
        .dbp-about-more {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 24px;
          color: #ff9e8d;
          font-size: 0.9rem;
          font-weight: 600;
          text-decoration: none;
          letter-spacing: 0.03em;
        }
        .dbp-about-more:hover { color: #ff7e67; text-decoration: underline; }

        /* ─── ABOUT PAGE (standalone /about) ─── */
        .dbp-ap-wrap { max-width: 1100px; margin: 0 auto; padding-left: 24px; padding-right: 24px; }
        .dbp-ap-eyebrow {
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #ff7e67;
          margin-bottom: 14px;
        }
        .dbp-ap-intro {
          background: #fff5f2;
          padding: 72px 0 56px;
          border-bottom: 1px solid rgba(255, 126, 103, 0.15);
        }
        .dbp-ap-intro h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.4rem, 5vw, 3.6rem);
          font-weight: 600;
          line-height: 1.1;
          margin: 0;
          color: #18181b;
        }
        .dbp-ap-address { margin-top: 14px; color: #71717a; font-size: 0.95rem; }
        .dbp-ap-story {
          display: grid;
          grid-template-columns: 5fr 7fr;
          gap: 72px;
          align-items: center;
          padding-top: 88px;
          padding-bottom: 88px;
        }
        .dbp-ap-visual { position: relative; }
        .dbp-ap-visual::before {
          content: '';
          position: absolute;
          inset: 20px -20px -20px 20px;
          border: 2px solid #ff7e67;
          border-radius: 20px;
        }
        .dbp-ap-photo {
          position: relative;
          aspect-ratio: 4 / 5;
          border-radius: 20px;
          background-size: cover;
          background-position: center;
          box-shadow: 0 24px 60px rgba(24, 24, 27, 0.18);
        }
        .dbp-ap-monogram {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #ff7e67, #e0533c);
          font-family: 'Playfair Display', serif;
          font-size: 8rem;
          color: #ffffff;
        }
        .dbp-ap-text p {
          font-size: 1.08rem;
          line-height: 1.85;
          color: #3f3f46;
          margin: 0 0 18px 0;
        }
        .dbp-ap-text p:first-child::first-letter {
          font-family: 'Playfair Display', serif;
          float: left;
          font-size: 3.8rem;
          line-height: 0.9;
          color: #ff7e67;
          padding: 6px 12px 0 0;
        }
        .dbp-ap-pills { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }
        .dbp-ap-pill {
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: #e0533c;
          background: #fff5f2;
          border: 1px solid rgba(255, 126, 103, 0.3);
          padding: 7px 16px;
          border-radius: 100px;
        }
        .dbp-ap-pill-dark { color: #ffffff; background: #18181b; border-color: #18181b; }
        .dbp-ap-stats { background: #18181b; padding: 56px 0; }
        .dbp-ap-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 32px;
          text-align: center;
        }
        .dbp-ap-stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 2.6rem;
          color: #ff7e67;
          line-height: 1.1;
        }
        .dbp-ap-stat-label {
          margin-top: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.55);
        }
        .dbp-ap-block { padding-top: 88px; padding-bottom: 88px; }
        .dbp-ap-block h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.8rem, 3.5vw, 2.4rem);
          font-weight: 600;
          margin: 0 0 36px 0;
        }
        .dbp-ap-amenities {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }
        .dbp-ap-amenity {
          background: #ffffff;
          border: 1px solid #f4e4df;
          border-top: 3px solid #ff7e67;
          border-radius: 16px;
          padding: 26px;
          box-shadow: 0 8px 24px rgba(255, 126, 103, 0.06);
        }
        .dbp-ap-amenity h3 {
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #18181b;
          margin: 0 0 16px 0;
        }
        .dbp-ap-amenity ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
        .dbp-ap-amenity li { font-size: 0.93rem; color: #52525b; display: flex; gap: 10px; }
        .dbp-ap-amenity li::before { content: '✓'; color: #ff7e67; font-weight: 700; flex-shrink: 0; }
        .dbp-ap-visit-band { background: #fff5f2; padding: 88px 0; }
        .dbp-ap-visit { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: stretch; }
        .dbp-ap-hours {
          background: #ffffff;
          border-radius: 20px;
          padding: 36px;
          border: 1px solid #f4e4df;
        }
        .dbp-ap-hours h3, .dbp-ap-cta h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          font-weight: 600;
          margin: 0 0 20px 0;
        }
        .dbp-ap-hour-row {
          display: flex;
          justify-content: space-between;
          padding: 11px 0;
          border-bottom: 1px dashed #f0d6cf;
          font-size: 0.93rem;
          color: #3f3f46;
        }
        .dbp-ap-hour-row:last-child { border-bottom: none; }
        .dbp-ap-cta {
          background: linear-gradient(135deg, #ff7e67, #e0533c);
          color: #ffffff;
          border-radius: 20px;
          padding: 36px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .dbp-ap-cta-label {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          opacity: 0.8;
          margin-bottom: 12px;
        }
        .dbp-ap-cta p { margin: 0 0 8px 0; line-height: 1.6; opacity: 0.92; }
        .dbp-ap-cta-phone { color: #ffffff; font-weight: 600; text-decoration: none; margin-bottom: 8px; }
        .dbp-ap-cta-phone:hover { text-decoration: underline; }
        .dbp-ap-cta-btn {
          margin-top: auto;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #18181b;
          color: #ffffff;
          padding: 14px 28px;
          border-radius: 100px;
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none;
          transition: transform 0.2s ease;
        }
        .dbp-ap-cta-btn:hover { transform: translateY(-2px); }

        /* ─── SERVICES ─── */
        .dbp-services {
          padding: 100px 24px;
          background: #ffffff;
          text-align: center;
        }
        .dbp-services-inner { max-width: 700px; margin: 0 auto; }
        .dbp-services-eyebrow {
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #ff7e67;
          margin-bottom: 16px;
        }
        .dbp-services h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 2.8rem);
          font-weight: 600;
          color: #18181b;
          margin: 0 0 12px 0;
        }
        .dbp-services-desc {
          font-size: 1rem;
          line-height: 1.8;
          color: #71717a;
          margin-bottom: 48px;
        }
        .dbp-service-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 0;
          border-bottom: 1px solid #ffd8cc;
          transition: all 0.25s ease;
          cursor: default;
        }
        .dbp-service-item:first-child { border-top: 1px solid #ffd8cc; }
        .dbp-service-item:hover { padding-left: 16px; }
        .dbp-service-name {
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: #18181b;
          text-transform: uppercase;
        }
        .dbp-service-arrow {
          width: 20px;
          height: 20px;
          color: #ff7e67;
          opacity: 0;
          transform: translateX(-8px);
          transition: all 0.25s ease;
        }
        .dbp-service-item:hover .dbp-service-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        /* ─── REVIEWS ─── */
        .dbp-reviews {
          padding: 100px 24px;
          background: #fff5f2;
          text-align: center;
        }
        .dbp-reviews-inner { max-width: 1100px; margin: 0 auto; }
        .dbp-reviews h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 2.8rem);
          font-weight: 600;
          color: #18181b;
          margin: 0 0 20px 0;
        }
        .dbp-rv-score-row {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }
        .dbp-rv-score {
          font-family: 'Playfair Display', serif;
          font-size: 2.2rem;
          color: #18181b;
          line-height: 1;
        }
        .dbp-rv-score-stars { color: #ff7e67; letter-spacing: 2px; }
        .dbp-rv-score-count { color: #71717a; font-size: 0.92rem; }
        .dbp-rv-summary {
          max-width: 760px;
          margin: 0 auto;
          font-size: 1.05rem;
          line-height: 1.85;
          color: #3f3f46;
        }
        .dbp-rv-summary-note {
          margin: 12px 0 0 0;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #a1a1aa;
        }
        .dbp-rv-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 48px;
          text-align: left;
        }
        .dbp-rv-card {
          background: #ffffff;
          border: 1px solid #f4e4df;
          border-radius: 16px;
          padding: 26px;
          box-shadow: 0 8px 24px rgba(255, 126, 103, 0.06);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .dbp-rv-card-head { display: flex; align-items: center; gap: 12px; }
        .dbp-rv-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff7e67, #e0533c);
          color: #ffffff;
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .dbp-rv-author { font-weight: 600; color: #18181b; font-size: 0.95rem; }
        .dbp-rv-date { color: #a1a1aa; font-size: 0.8rem; margin-top: 2px; }
        .dbp-rv-stars { color: #ff7e67; letter-spacing: 2px; font-size: 0.9rem; }
        .dbp-rv-comment {
          margin: 0;
          color: #52525b;
          font-size: 0.95rem;
          line-height: 1.7;
          white-space: pre-line;
        }
        .dbp-rv-clamp {
          display: -webkit-box;
          -webkit-line-clamp: 5;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .dbp-rv-more {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 40px;
          color: #e0533c;
          font-size: 0.9rem;
          font-weight: 600;
          text-decoration: none;
          letter-spacing: 0.03em;
        }
        .dbp-rv-more:hover { color: #ff7e67; text-decoration: underline; }
        .dbp-rv-empty { color: #a1a1aa; margin: 24px 0 0 0; }

        /* ─── REVIEWS PAGE (standalone /reviews) ─── */
        .dbp-rp-overview {
          display: grid;
          grid-template-columns: 5fr 7fr;
          gap: 48px;
          align-items: start;
          padding-top: 72px;
          padding-bottom: 24px;
        }
        .dbp-rp-overview.no-summary { grid-template-columns: minmax(0, 520px); }
        .dbp-rp-rating {
          background: #18181b;
          color: #ffffff;
          border-radius: 20px;
          padding: 36px;
        }
        .dbp-rp-rating-score {
          font-family: 'Playfair Display', serif;
          font-size: 3.6rem;
          line-height: 1;
          color: #ff7e67;
        }
        .dbp-rp-rating-stars { color: #ff7e67; letter-spacing: 3px; margin-top: 10px; }
        .dbp-rp-rating-total { color: rgba(255, 255, 255, 0.6); font-size: 0.9rem; margin-top: 8px; }
        .dbp-rp-bars { margin-top: 28px; display: flex; flex-direction: column; gap: 10px; }
        .dbp-rp-bar-row { display: grid; grid-template-columns: 34px 1fr 28px; gap: 12px; align-items: center; font-size: 0.85rem; }
        .dbp-rp-bar-label { color: rgba(255, 255, 255, 0.7); }
        .dbp-rp-bar-track { height: 8px; border-radius: 100px; background: rgba(255, 255, 255, 0.1); overflow: hidden; }
        .dbp-rp-bar-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, #ff7e67, #e0533c); }
        .dbp-rp-bar-count { color: rgba(255, 255, 255, 0.55); text-align: right; }
        .dbp-rp-bars-note { margin-top: 16px; font-size: 0.75rem; color: rgba(255, 255, 255, 0.4); }
        .dbp-rp-summary h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.8rem, 3.5vw, 2.4rem);
          font-weight: 600;
          margin: 0 0 20px 0;
        }
        .dbp-rp-summary p {
          font-size: 1.08rem;
          line-height: 1.85;
          color: #3f3f46;
          margin: 0;
          white-space: pre-line;
        }
        .dbp-rp-list { padding-top: 64px; padding-bottom: 88px; }
        .dbp-rp-list h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.8rem, 3.5vw, 2.4rem);
          font-weight: 600;
          margin: 0;
        }
        .dbp-rp-list .dbp-rv-grid { margin-top: 32px; }

        /* ─── CTA BANNER ─── */
        .dbp-cta {
          background: linear-gradient(135deg, #ff7e67 0%, #e0533c 100%);
          padding: 80px 24px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .dbp-cta::before {
          content: '';
          position: absolute;
          top: -50%;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 60%);
          border-radius: 50%;
          pointer-events: none;
        }
        .dbp-cta-inner { position: relative; z-index: 2; }
        .dbp-cta h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4.5vw, 3.2rem);
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 16px 0;
          letter-spacing: 0.02em;
        }
        .dbp-cta-desc {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: 36px;
          font-weight: 300;
        }
        .dbp-cta-btn {
          background: #ffffff;
          color: #e0533c;
          border: none;
          padding: 16px 44px;
          font-size: 0.92rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 12px;
          transition: all 0.3s ease;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          font-family: inherit;
          text-decoration: none;
          display: inline-block;
        }
        .dbp-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
        }

        /* ─── CONTACT ─── */
        .dbp-contact {
          padding: 100px 24px;
          background: #fff5f2;
        }
        .dbp-contact-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: start;
        }
        .dbp-contact-eyebrow {
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #ff7e67;
          margin-bottom: 12px;
        }
        .dbp-contact h2 {
          font-family: 'Playfair Display', serif;
          font-size: 2.2rem;
          font-weight: 600;
          margin: 0 0 28px 0;
          color: #18181b;
        }
        .dbp-contact-detail {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 16px;
          font-size: 1.02rem;
          color: #3f3f46;
        }
        .dbp-contact-icon {
          width: 40px;
          height: 40px;
          background: #ffffff;
          border: 1px solid #ffd8cc;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .dbp-contact-icon svg { width: 18px; height: 18px; color: #ff7e67; }
        .dbp-contact-detail a { color: inherit; text-decoration: none; }
        .dbp-contact-detail a:hover { color: #ff7e67; text-decoration: underline; }
        .dbp-hours-title {
          font-size: 0.88rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #18181b;
          margin: 36px 0 20px 0;
        }
        .dbp-hour-row {
          display: flex;
          justify-content: space-between;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255, 126, 103, 0.12);
          font-size: 0.95rem;
          color: #3f3f46;
        }
        .dbp-hour-row:first-child { border-top: 1px solid rgba(255, 126, 103, 0.12); }
        .dbp-hour-day { font-weight: 500; }
        .dbp-hour-time { color: #71717a; }
        .dbp-map-wrap {
          width: 100%;
          height: 480px;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #ffd8cc;
          box-shadow: 0 12px 40px rgba(255, 126, 103, 0.1);
        }
        .dbp-map-wrap iframe { border: 0; }

        /* ─── FOOTER ─── */
        .dbp-footer {
          background: #18181b;
          padding: 40px 24px;
          text-align: center;
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.88rem;
        }
        .dbp-footer-brand {
          color: #ff7e67;
          font-weight: 600;
        }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 768px) {
          .dbp-header { padding: 14px 20px; }
          .dbp-header.scrolled { padding: 10px 20px; }
          .dbp-nav { gap: 4px; }
          .dbp-nav { gap: 2px; flex-wrap: wrap; justify-content: flex-end; }
          .dbp-nav-btn { padding: 6px 8px; font-size: 0.8rem; }
          .dbp-hero { padding: 72px 20px 64px; }
          .dbp-features { grid-template-columns: 1fr; }
          .dbp-feature-card + .dbp-feature-card { border-left: none; border-top: 1px solid rgba(255, 126, 103, 0.12); }
          .dbp-contact-inner { grid-template-columns: 1fr; gap: 40px; }
          .dbp-map-wrap { height: 320px; }
          .dbp-ap-intro { padding: 48px 0 40px; }
          .dbp-ap-story { grid-template-columns: 1fr; gap: 48px; padding-top: 56px; padding-bottom: 56px; }
          .dbp-ap-visual { max-width: 360px; margin-right: 20px; }
          .dbp-ap-block, .dbp-ap-visit-band { padding-top: 56px; padding-bottom: 56px; }
          .dbp-ap-visit { grid-template-columns: 1fr; }
          .dbp-ap-hours, .dbp-ap-cta { padding: 28px; }
          .dbp-reviews { padding: 64px 20px; }
          .dbp-rv-grid { grid-template-columns: 1fr; }
          .dbp-rp-overview { grid-template-columns: 1fr; gap: 32px; padding-top: 48px; }
          .dbp-rp-rating { padding: 28px; }
          .dbp-rp-list { padding-top: 48px; padding-bottom: 56px; }
        }
      `}</style>

      <div className="dbp-root">

        {/* ─── HEADER ─── */}
        <header className={`dbp-header ${scrolled ? 'scrolled' : ''}`}>
          <div className="dbp-header-brand">
            <div className="dbp-header-logo">
              {shortName.charAt(0)}
            </div>
            <div className="dbp-header-name">{shortName}</div>
          </div>
          <nav className="dbp-nav">
            {['home', 'about', 'services', 'reviews', 'contact'].map((id) => (
              <a
                key={id}
                href={hrefFor(id)}
                className={`dbp-nav-btn ${activeNav === id ? 'active' : ''}`}
                // About, Reviews and Contact are their own pages, so they always
                // navigate. Home and Services have no page of their own — on the
                // one-page home view their targets are already on screen, so
                // scroll there.
                onClick={(e) => {
                  if (page !== 'home' || ['about', 'reviews', 'contact'].includes(id)) return;
                  e.preventDefault();
                  scrollToSection(id === 'home' ? 'hero' : id);
                }}
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </a>
            ))}
          </nav>
        </header>

        {/* ─── HERO ─── */}
        {isHome && (
        <section id="hero" className="dbp-hero">
          {heroImage && (
            <>
              <div className="dbp-hero-image" style={{ backgroundImage: `url(${heroImage})` }} />
              <div className="dbp-hero-scrim" />
            </>
          )}
          <div className="dbp-hero-inner">
            <div className="dbp-hero-badge">
              <span className="dbp-hero-badge-dot" />
              Now Open
            </div>
            <h1>{shortName}</h1>
            <div className="dbp-hero-address">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              {address}
            </div>
            {rating > 0 && (
              <div className="dbp-hero-rating">
                <span className="dbp-hero-rating-stars">{'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}</span>
                <span className="dbp-hero-rating-score">{rating}</span>
                {reviewCount > 0 && <span className="dbp-hero-rating-count">({reviewCount} reviews)</span>}
              </div>
            )}
            <button className="dbp-hero-cta" onClick={() => scrollToSection('contact')}>
              Get In Touch
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </section>
        )}

        {/* ─── FEATURES ─── */}
        {isHome && (
        <section className="dbp-features">
          {featureCards.map((card, i) => (
            <div key={i} className="dbp-feature-card">
              <div className="dbp-feature-label">{card.label}</div>
              <div className="dbp-feature-title">{card.title}</div>
              <div className="dbp-feature-sub">{card.subtitle}</div>
            </div>
          ))}
        </section>
        )}

        {/* ─── ABOUT ─── */}
        {isHome && (
        <section id="about" className="dbp-about">
          <div className="dbp-about-inner">
            <div className="dbp-about-eyebrow">Our Story</div>
            <h2>About {shortName}</h2>
            <p>{aboutPreview}</p>
            {aboutParagraphs.length > 1 && (
              <a className="dbp-about-more" href={hrefFor('about')}>
                Read Our Full Story
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            )}
          </div>
        </section>
        )}

        {/* ─── ABOUT PAGE ─── */}
        {/* The standalone /about page gets its own light, editorial layout so it
            doesn't read as a copy of the dark About band on the home page. */}
        {page === 'about' && (
        <section id="about" className="dbp-ap">
          <div className="dbp-ap-intro">
            <div className="dbp-ap-wrap">
              <div className="dbp-ap-eyebrow">Our Story</div>
              <h1>About {shortName}</h1>
              {business.address && <div className="dbp-ap-address">{business.address}</div>}
            </div>
          </div>

          <div className="dbp-ap-wrap dbp-ap-story">
            <div className="dbp-ap-visual">
              {heroImage ? (
                <div className="dbp-ap-photo" style={{ backgroundImage: `url(${heroImage})` }} role="img" aria-label={shortName} />
              ) : (
                <div className="dbp-ap-photo dbp-ap-monogram">{shortName.charAt(0)}</div>
              )}
            </div>
            <div className="dbp-ap-text">
              {aboutParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
              {(type || categories.length > 0 || priceRange) && (
                <div className="dbp-ap-pills">
                  {type && <span className="dbp-ap-pill dbp-ap-pill-dark">{type}</span>}
                  {categories.slice(0, 6).map((cat, i) => (
                    <span key={i} className="dbp-ap-pill">{cat}</span>
                  ))}
                  {priceRange && <span className="dbp-ap-pill">{priceRange}</span>}
                </div>
              )}
            </div>
          </div>

          {aboutStats.length > 0 && (
            <div className="dbp-ap-stats">
              <div className="dbp-ap-wrap dbp-ap-stats-grid">
                {aboutStats.map((stat) => (
                  <div key={stat.label} className="dbp-ap-stat">
                    <div className="dbp-ap-stat-value">{stat.value}</div>
                    <div className="dbp-ap-stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {amenitySections.length > 0 && (
            <div className="dbp-ap-wrap dbp-ap-block">
              <div className="dbp-ap-eyebrow">Good To Know</div>
              <h2>What to Expect</h2>
              <div className="dbp-ap-amenities">
                {amenitySections.map((sec) => (
                  <div key={sec.key} className="dbp-ap-amenity">
                    <h3>{sec.label}</h3>
                    <ul>
                      {sec.items.slice(0, 6).map((item, i) => (
                        <li key={i}>{typeof item === 'string' ? item : item.name}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="dbp-ap-visit-band">
            <div className="dbp-ap-wrap dbp-ap-visit">
              <div className="dbp-ap-hours">
                <h3>Opening Hours</h3>
                {businessHours.map((item, idx) => (
                  <div key={idx} className="dbp-ap-hour-row">
                    <span>{item.day}</span>
                    <span>{item.hours}</span>
                  </div>
                ))}
              </div>
              <div className="dbp-ap-cta">
                <div className="dbp-ap-cta-label">Visit Us</div>
                <h3>Come see us at {shortName}</h3>
                {business.address && <p>{business.address}</p>}
                {business.phone && (
                  <a className="dbp-ap-cta-phone" href={`tel:${business.phone.replace(/[^\d+]/g, '')}`}>{business.phone}</a>
                )}
                <a className="dbp-ap-cta-btn" href={hrefFor('contact')}>
                  Contact Us
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* ─── SERVICES ─── */}
        {isHome && (
        <section id="services" className="dbp-services">
          <div className="dbp-services-inner">
            <div className="dbp-services-eyebrow">What We Offer</div>
            <h2>Our Services</h2>
            <p className="dbp-services-desc">
              {business.servicesDescription || 'Premium services tailored for you. Membership pricing and exclusive offers available.'}
            </p>
            <div>
              {services.map((srv, idx) => (
                <div key={idx} className="dbp-service-item">
                  <span className="dbp-service-name">
                    {typeof srv === 'string' ? srv : srv.name}
                  </span>
                  <svg className="dbp-service-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </section>
        )}

        {/* ─── REVIEWS ─── */}
        {isHome && (
        <section id="reviews" className="dbp-reviews">
          <div className="dbp-reviews-inner">
            <div className="dbp-services-eyebrow">Testimonials</div>
            <h2>What Our Customers Say</h2>
            {!hasReviewContent && (
              <p className="dbp-rv-empty">No reviews yet — be the first to share your experience.</p>
            )}
            {avgRating > 0 && (
              <div className="dbp-rv-score-row">
                <span className="dbp-rv-score">{avgRating.toFixed(1)}</span>
                <span className="dbp-rv-score-stars">{renderStars(avgRating)}</span>
                {reviewCount > 0 && (
                  <span className="dbp-rv-score-count">{reviewCount.toLocaleString()} review{reviewCount === 1 ? '' : 's'}</span>
                )}
              </div>
            )}
            {reviewsSummary && (
              <>
                <p className="dbp-rv-summary">{reviewsSummary}</p>
                <p className="dbp-rv-summary-note">Summarised from customer reviews</p>
              </>
            )}
            {topReviews.length > 0 && (
              <div className="dbp-rv-grid">
                {topReviews.map((review, idx) => renderReviewCard(review, idx, false))}
              </div>
            )}
            {reviewsList.length > 0 && (
              <a className="dbp-rv-more" href={hrefFor('reviews')}>
                See All Reviews
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            )}
          </div>
        </section>
        )}

        {/* ─── REVIEWS PAGE ─── */}
        {page === 'reviews' && (
        <section id="reviews" className="dbp-rp">
          <div className="dbp-ap-intro">
            <div className="dbp-ap-wrap">
              <div className="dbp-ap-eyebrow">What Clients Say</div>
              <h1>{shortName} Reviews</h1>
              {business.address && <div className="dbp-ap-address">{business.address}</div>}
            </div>
          </div>

          <div className={`dbp-ap-wrap dbp-rp-overview ${reviewsSummary ? '' : 'no-summary'}`}>
            <div className="dbp-rp-rating">
              <div className="dbp-rp-rating-score">{avgRating > 0 ? avgRating.toFixed(1) : '–'}</div>
              <div className="dbp-rp-rating-stars">{renderStars(avgRating)}</div>
              <div className="dbp-rp-rating-total">
                {reviewCount > 0 ? `Based on ${reviewCount.toLocaleString()} review${reviewCount === 1 ? '' : 's'}` : 'No reviews yet'}
              </div>
              {ratedReviews.length > 0 && (
                <>
                  <div className="dbp-rp-bars">
                    {starCounts.map(({ star, count }) => (
                      <div key={star} className="dbp-rp-bar-row">
                        <span className="dbp-rp-bar-label">{star} ★</span>
                        <div className="dbp-rp-bar-track">
                          <div className="dbp-rp-bar-fill" style={{ width: `${(count / ratedReviews.length) * 100}%` }} />
                        </div>
                        <span className="dbp-rp-bar-count">{count}</span>
                      </div>
                    ))}
                  </div>
                  {/* The breakdown only covers the reviews on file, which can be
                      far fewer than the total count Google reports. */}
                  {ratedReviews.length < reviewCount && (
                    <div className="dbp-rp-bars-note">Breakdown of the {ratedReviews.length} reviews shown below</div>
                  )}
                </>
              )}
            </div>
            {reviewsSummary && (
              <div className="dbp-rp-summary">
                <div className="dbp-ap-eyebrow">In Short</div>
                <h2>What People Are Saying</h2>
                <p>{reviewsSummary}</p>
                <p className="dbp-rv-summary-note" style={{ textAlign: 'left' }}>Summarised from customer reviews</p>
              </div>
            )}
          </div>

          <div className="dbp-ap-wrap dbp-rp-list">
            <h2>All Reviews</h2>
            {reviewsList.length > 0 ? (
              <div className="dbp-rv-grid">
                {reviewsList.map((review, idx) => renderReviewCard(review, idx, true))}
              </div>
            ) : (
              <p className="dbp-rv-empty">No reviews yet.</p>
            )}
          </div>
        </section>
        )}

        {/* ─── CTA ─── */}
        {(isHome || page === 'reviews') && (
        <section className="dbp-cta">
          <div className="dbp-cta-inner">
            <h2>Ready to Experience the Difference?</h2>
            <p className="dbp-cta-desc">We deliver passion, precision, and care — every visit.</p>
            <a className="dbp-cta-btn" href={hrefFor('contact')}>
              BOOK NOW
            </a>
          </div>
        </section>
        )}

        {/* ─── CONTACT ─── */}
        {(isHome || page === 'contact') && (
        <section id="contact" className="dbp-contact">
          <div className="dbp-contact-inner">
            <div>
              <div className="dbp-contact-eyebrow">Get In Touch</div>
              <h2>Contact {shortName}</h2>

              <div className="dbp-contact-detail">
                <div className="dbp-contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                  </svg>
                </div>
                <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a>
              </div>

              <div className="dbp-contact-detail">
                <div className="dbp-contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                </div>
                {address}
              </div>

              {business.email && (
                <div className="dbp-contact-detail">
                  <div className="dbp-contact-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <a href={`mailto:${business.email}`}>{business.email}</a>
                </div>
              )}

              <h3 className="dbp-hours-title">Business Hours</h3>
              <div>
                {businessHours.map((item, idx) => (
                  <div key={idx} className="dbp-hour-row">
                    <span className="dbp-hour-day">{item.day}</span>
                    <span className="dbp-hour-time">{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dbp-map-wrap">
              <iframe
                width="100%"
                height="100%"
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps?q=${encodeURIComponent(shortName + ' ' + address)}&z=15&output=embed`}
              />
            </div>
          </div>
        </section>
        )}

        {/* ─── FOOTER ─── */}
        <footer className="dbp-footer">
          © {new Date().getFullYear()} <span className="dbp-footer-brand">{shortName}</span> · Powered by DoersMarketing
        </footer>

      </div>
    </>
  );
}
