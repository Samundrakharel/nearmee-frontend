export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <a href="/" className="logo">
            <svg width="100" height="30" viewBox="0 0 110 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="28" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="24" fill="#3B82F6" style={{ letterSpacing: '-1px' }}>near</text>
              <circle cx="75" cy="20" r="18" fill="#3B82F6" />
              <text x="60" y="28" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="24" fill="white" style={{ letterSpacing: '-1px' }}>me</text>
            </svg>
          </a>
          <p>
            Discover the best local businesses in Sydney. From restaurants to
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
        &copy; {new Date().getFullYear()} near me. All rights reserved.
      </div>
    </footer>
  );
}
