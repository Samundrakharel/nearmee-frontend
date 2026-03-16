export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <a href="/" className="logo">
            <span className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
            </span>
            nearmee
          </a>
          <p>
            Discover the best local businesses in your area. From restaurants to
            services, find everything you need near you.
          </p>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="#" id="footer-about">About Us</a></li>
            <li><a href="#" id="footer-contact">Contact Us</a></li>
            <li><a href="#" id="footer-list">List Your Business</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><a href="#" id="footer-privacy">Privacy Policy</a></li>
            <li><a href="#" id="footer-terms">Terms of Service</a></li>
            <li><a href="#" id="footer-accessibility">Accessibility</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} nearmee. All rights reserved.
      </div>
    </footer>
  );
}
