import './globals.css';
import { LocationProvider } from './context/LocationContext';
import { AuthProvider } from './context/AuthContext';
import PageScriptLoader from './components/PageScriptLoader';

export const metadata = {
  title: 'Nearmee - Find the Best Local Businesses Near You',
  description: 'Discover the best local businesses in your area. From restaurants to services, find everything you need near you.',
  alternates: {
    canonical: 'https://www.nearmee.net',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-RYVZ90Z0JH"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RYVZ90Z0JH');
          `
        }} />

        {/*
          Inline styles for the loader so they apply BEFORE globals.css downloads.
          This ensures the loader is visible on very first paint.
        */}
        <style dangerouslySetInnerHTML={{
          __html: `
          #page-loader {
            position: fixed; inset: 0; z-index: 99999;
            background: #fff;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center; gap: 24px;
            transition: opacity 0.35s ease, visibility 0.35s ease;
          }
          #page-loader.hidden { opacity: 0; visibility: hidden; pointer-events: none; }
          .loader-hex-path {
            animation: _hexDash 2s linear infinite;
          }
          @keyframes _hexDash {
            0%   { stroke-dashoffset: 300; }
            100% { stroke-dashoffset: 0; }
          }
          .loader-logo-svg { animation: _pulse 1.6s ease-in-out infinite; }
          .loader-label {
            font-family: Inter, system-ui, sans-serif;
            font-size: 0.92rem; font-weight: 500;
            color: #64748b; letter-spacing: 0.04em;
            animation: _fade 1.6s ease-in-out infinite;
          }
          @keyframes _pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%       { opacity: 0.7; transform: scale(0.95); }
          }
          @keyframes _fade {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.4; }
          }
          #page-progress-bar {
            position: fixed; top: 0; left: 0; height: 3px; width: 0%;
            background: linear-gradient(90deg, #3b82f6, #60a5fa);
            z-index: 100000; transition: width 0.4s ease;
            box-shadow: 0 0 10px rgba(59,130,246,0.6);
          }
        `}} />

        {/*
          Inline script runs synchronously before any React code.
          Shows the loader immediately on hard refresh / first load,
          then hides it once the page is fully interactive.
        */}
        <script dangerouslySetInnerHTML={{
          __html: `
          (function () {
            // Inject a top progress bar
            var bar = document.createElement('div');
            bar.id = 'page-progress-bar';
            document.documentElement.appendChild(bar);

            // Grow the bar while loading
            var width = 10;
            var interval = setInterval(function () {
              width = Math.min(width + Math.random() * 10, 85);
              bar.style.width = width + '%';
            }, 300);

            function finish() {
              clearInterval(interval);
              bar.style.width = '100%';
              setTimeout(function () { bar.style.opacity = '0'; }, 400);
              setTimeout(function () { bar.remove(); }, 800);

              var loader = document.getElementById('page-loader');
              if (loader) {
                loader.classList.add('hidden');
                // Removed loader.remove() to prevent React "node to be removed is not a child" errors during client-side navigation.
              }
            }

            // Hide on full page load OR after React hydration fires
            if (document.readyState === 'complete') {
              finish();
            } else {
              window.addEventListener('load', finish, { once: true });
            }
          })();
        `}} />
      </head>
      <body>
        {/*
          The pre-hydration loader — visible immediately from the first byte of HTML.
          Rendered as plain HTML so it shows even before JS loads.
        */}
        <div id="page-loader" aria-hidden="true" suppressHydrationWarning>
          {/* near me logo — on top */}
          <div className="loader-logo">
            <svg
              className="loader-logo-svg"
              width="120"
              height="42"
              viewBox="0 0 110 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <text
                x="0" y="28"
                fontFamily="Inter, sans-serif"
                fontWeight="800"
                fontSize="24"
                fill="#3B82F6"
                style={{ letterSpacing: '-1px' }}
              >near</text>
              <circle cx="75" cy="20" r="18" fill="#3B82F6" />
              <text
                x="60" y="28"
                fontFamily="Inter, sans-serif"
                fontWeight="800"
                fontSize="24"
                fill="white"
                style={{ letterSpacing: '-1px' }}
              >me</text>
            </svg>
          </div>

          {/* Snake-crawling hexagon — below logo */}
          <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
              stroke="#3b82f6"
              strokeWidth="6"
              fill="none"
              opacity="0.2"
            />
            <path
              d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
              stroke="#3b82f6"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="100 200"
              className="loader-hex-path"
            />
          </svg>

          {/* Label */}
          <span className="loader-label">Almost there…</span>
        </div>

        <PageScriptLoader />

        <AuthProvider>
          <LocationProvider>
            {children}
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
