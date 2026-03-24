'use client';

export default function Header() {
  return (
    <header className="header" id="header">
      <div className="header-inner">
        {/* Logo */}
        <a href="/" className="logo" id="logo">
          <svg width="110" height="40" viewBox="0 0 110 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="28" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="24" fill="#3B82F6" style={{ letterSpacing: '-1px' }}>near</text>
            <circle cx="75" cy="20" r="18" fill="#3B82F6" />
            <text x="60" y="28" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="24" fill="white" style={{ letterSpacing: '-1px' }}>me</text>
          </svg>
        </a>

        {/* Search Bar */}
        <div className="search-bar">
          <div className="search-input-group">
            <span className="search-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </span>
            <input type="text" placeholder="What are you looking for?" id="search-input" />
          </div>
          <div className="location-input-group">
            <span className="location-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
            </span>
            <input type="text" placeholder="Where?" id="location-input" />
          </div>
          <button className="btn-search" id="btn-search">Search</button>
        </div>

        {/* Nav Links */}
        <nav className="nav-links">
          <button className="btn-login" id="btn-login">Login</button>
          <button className="btn-signup" id="btn-signup">Sign Up</button>
        </nav>
      </div>
    </header>
  );
}
