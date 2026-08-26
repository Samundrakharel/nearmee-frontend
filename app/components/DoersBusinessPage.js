'use client';

import { useState, useEffect } from 'react';

export default function DoersBusinessPage({ business }) {
  const [activeNav, setActiveNav] = useState('home');
  const [scrolled, setScrolled] = useState(false);

  const bizName = business.name || 'Le Barbier Sam';
  const shortName = bizName.split('|')[0].trim();
  const address = business.address || '141C Bd Gréber, Gatineau, Quebec J8T 3R1';
  const phone = business.phone || '(819) 775-1049';
  const aboutText = business.aboutUs || business.description || `At ${shortName}, we set the standard for modern services in ${address.split(',').slice(-2).join(',').trim()}. Trusted by clients searching for reliable professionals, we combine skill, passion, and attention to detail in everything we do.\n\nWhether you're a regular or visiting for the first time, we deliver a premium experience every single time.`;
  const services = business.services?.length ? business.services : ['HAIR CUT', 'HAIR STYLE', 'FADE UP', 'BEARD', 'BEARD COLOR'];
  const categories = business.categories || [];
  const rating = business.rating || 4.7;
  const reviewCount = business.reviewCount || business.reviews?.length || 0;

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

  const businessHours = business.businessHours || [
    { day: 'Monday', hours: '8:00 AM – 8:00 PM' },
    { day: 'Tuesday', hours: '8:00 AM – 9:00 PM' },
    { day: 'Wednesday', hours: '8:00 AM – 9:00 PM' },
    { day: 'Thursday', hours: '9:00 AM – 9:00 PM' },
    { day: 'Friday', hours: '9:00 AM – 9:00 PM' },
    { day: 'Saturday', hours: '9:00 AM – 7:00 PM' },
    { day: 'Sunday', hours: 'Closed' },
  ];

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
          .dbp-nav-btn { padding: 6px 12px; font-size: 0.82rem; }
          .dbp-hero { padding: 72px 20px 64px; }
          .dbp-features { grid-template-columns: 1fr; }
          .dbp-feature-card + .dbp-feature-card { border-left: none; border-top: 1px solid rgba(255, 126, 103, 0.12); }
          .dbp-contact-inner { grid-template-columns: 1fr; gap: 40px; }
          .dbp-map-wrap { height: 320px; }
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
            {['home', 'about', 'services', 'contact'].map((id) => (
              <button
                key={id}
                className={`dbp-nav-btn ${activeNav === id ? 'active' : ''}`}
                onClick={() => scrollToSection(id === 'home' ? 'hero' : id)}
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </nav>
        </header>

        {/* ─── HERO ─── */}
        <section id="hero" className="dbp-hero">
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

        {/* ─── FEATURES ─── */}
        <section className="dbp-features">
          {featureCards.map((card, i) => (
            <div key={i} className="dbp-feature-card">
              <div className="dbp-feature-label">{card.label}</div>
              <div className="dbp-feature-title">{card.title}</div>
              <div className="dbp-feature-sub">{card.subtitle}</div>
            </div>
          ))}
        </section>

        {/* ─── ABOUT ─── */}
        <section id="about" className="dbp-about">
          <div className="dbp-about-inner">
            <div className="dbp-about-eyebrow">Our Story</div>
            <h2>About {shortName}</h2>
            <p>{aboutText}</p>
          </div>
        </section>

        {/* ─── SERVICES ─── */}
        <section id="services" className="dbp-services">
          <div className="dbp-services-inner">
            <div className="dbp-services-eyebrow">What We Offer</div>
            <h2>Our Services</h2>
            <p className="dbp-services-desc">
              Premium services tailored for you. Membership pricing and exclusive offers available.
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

        {/* ─── CTA ─── */}
        <section className="dbp-cta">
          <div className="dbp-cta-inner">
            <h2>Ready to Experience the Difference?</h2>
            <p className="dbp-cta-desc">We deliver passion, precision, and care — every visit.</p>
            <button className="dbp-cta-btn" onClick={() => scrollToSection('contact')}>
              BOOK NOW
            </button>
          </div>
        </section>

        {/* ─── CONTACT ─── */}
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
                {phone}
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

        {/* ─── FOOTER ─── */}
        <footer className="dbp-footer">
          © {new Date().getFullYear()} <span className="dbp-footer-brand">{shortName}</span> · Powered by DoersMarketing
        </footer>

      </div>
    </>
  );
}
