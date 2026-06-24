export default function Footer() {
  return (
    <footer className="footer" id="footer" style={{ borderTop: '1px solid var(--color-border)', backgroundColor: '#fff' }}>
      <style>{`
        .footer-col ul a {
          transition: color 0.2s ease;
        }
        .footer-col ul a:hover {
          color: #3B82F6 !important;
        }
      `}</style>
      <div className="footer-inner">
        <div className="footer-brand">
          <a href="/" className="logo">
            <svg width="100" height="30" viewBox="0 0 110 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="28" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="24" fill="#3B82F6" style={{ letterSpacing: '-1px' }}>near</text>
              <circle cx="75" cy="20" r="18" fill="#3B82F6" />
              <text x="60" y="28" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="24" fill="white" style={{ letterSpacing: '-1px' }}>me</text>
            </svg>
          </a>
          <p style={{ color: 'var(--color-text-medium)', lineHeight: '1.6', maxWidth: '300px' }}>
            Discover the best local businesses within your city. From restaurants to
            services, find everything you need near you.
          </p>
        </div>
        <div className="footer-col">
          <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Company</h4>
          <ul>
            <li><a href="#" id="footer-about" style={{ color: 'var(--color-text-medium)', fontSize: '0.95rem' }}>About Us</a></li>
            <li><a href="#" id="footer-contact" style={{ color: 'var(--color-text-medium)', fontSize: '0.95rem' }}>Contact Us</a></li>
            <li><a href="/signup?next=/submit-business" id="footer-list" style={{ color: 'var(--color-text-medium)', fontSize: '0.95rem' }}>List Your Business</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Legal</h4>
          <ul>
            <li><a href="#" id="footer-privacy" style={{ color: 'var(--color-text-medium)', fontSize: '0.95rem' }}>Privacy Policy</a></li>
            <li><a href="#" id="footer-terms" style={{ color: 'var(--color-text-medium)', fontSize: '0.95rem' }}>Terms of Service</a></li>
            <li><a href="#" id="footer-accessibility" style={{ color: 'var(--color-text-medium)', fontSize: '0.95rem' }}>Accessibility</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom" style={{ borderTop: '1px solid var(--color-border)', padding: '24px 0', textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
        &copy; {new Date().getFullYear()} nearmee. All rights reserved.
      </div>
    </footer>
  );
}

