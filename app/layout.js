import './globals.css';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import { LocationProvider } from './context/LocationContext';
import { AuthProvider } from './context/AuthContext';
import { SiteContentProvider } from './context/SiteContentContext';
import PageScriptLoader from './components/PageScriptLoader';
import { getFooterContent, getPageScripts, isBusinessSubdomain } from './lib/api';

// next/font self-hosts the font files and injects its own <link>/<style>
// tags via Next's normal head-management pipeline (the same one that renders
// title/description/robots/canonical), instead of a manual <link> that would
// require a literal <head> override — see the note on `headHtml` below for
// why that override is avoided.
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-inter',
});

// Pre-hydration loader CSS lives in globals.css (#page-loader etc.) and the
// matching script renders at the top of <body> below — neither needs to be
// literally inside <head>, which is what lets the root layout avoid a manual
// <head> override (see note on `headHtml`).
const STATIC_BODY_SCRIPTS = `
  <!-- ANALYTICS -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-RYVZ90Z0JH"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-RYVZ90Z0JH');
  </script>

  <!-- PRE-HYDRATION LOADER SCRIPT (styles are in globals.css) -->
  <script>
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
  </script>
`;

/**
 * Return the markup to inject for a script record.
 *
 * A record saved with script_type "javascript" often holds bare JS with no
 * surrounding tags — that is what the admin field invites you to paste. Parsed
 * as-is it would become inert text, so wrap it the same way
 * core/context_processors.py and PageScriptLoader.js do.
 */
function scriptMarkup(script) {
  const content = (script.script_content || '').trim();
  if (!content) return '';

  if (script.script_type === 'javascript' && !content.toLowerCase().startsWith('<script')) {
    return `<script>\n${content}\n</script>`;
  }
  return content;
}

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

export default async function RootLayout({ children }) {
  // Admin-managed footer content, fetched once per render for the whole tree.
  // A failure here must never take the site down — Footer falls back to its
  // built-in copy when this is null.
  const footer = await getFooterContent().catch(() => null);

  // Reading headers() here opts every route into dynamic (per-request)
  // rendering — required so admin-managed PageScripts are server-rendered
  // (and thus visible in "View Page Source", not just injected into the live
  // DOM by PageScriptLoader after hydration) for whichever page pattern
  // ("all", "homepage", "specific", "custom", business subdomain, etc.) the
  // current request actually matches.
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/';
  const host = headersList.get('host') || '';

  let matchedScripts = [];
  try {
    const result = await getPageScripts(pathname, host);
    if (Array.isArray(result)) matchedScripts = result;
  } catch (err) {
    console.error('Failed to load page scripts (SSR):', err);
  }

  const byPlacement = { head: [], body_start: [], body_end: [] };
  matchedScripts.forEach((script) => {
    const markup = scriptMarkup(script);
    const placement = script.placement || 'head';
    if (markup) {
      if (byPlacement[placement]) {
        byPlacement[placement].push(markup);
      } else {
        byPlacement.head.push(markup);
      }
    }
  });

  // Next.js always appends its own auto-managed <head> tags — charset,
  // viewport, and each route's `metadata`/`generateMetadata` output
  // (title, description, robots, canonical) — AFTER whatever a root layout
  // renders in a literal <head> element, with no way to reorder that. So the
  // root layout below renders NO <head> of its own (fonts moved to
  // next/font, the loader styles to globals.css) unless an admin has
  // actually configured a "head"-placement PageScript for this request —
  // only then do we fall back to a manual <head>, and only that admin
  // content (not our own markup) ends up ahead of the SEO tags for that one
  // page, exactly mirroring what the CMS field promises ("insert this before
  // </head>").
  //
  // SEO tags (title, description, robots, canonical) are deliberately NOT
  // duplicated here: each route supplies its own dynamic `metadata` export
  // (business name, city, etc.), and Next renders those into the <head> it
  // manages itself.
  let headHtml = byPlacement.head.join('\n');

  // Merge any body_start scripts into head for subdomain compatibility
  if (isBusinessSubdomain() && byPlacement.body_start.length) {
    headHtml += (headHtml ? '\n' : '') + byPlacement.body_start.join('\n');
  }

  // STATIC_BODY_SCRIPTS renders at the top of <body>.
  const bodyStartHtml = STATIC_BODY_SCRIPTS;
  const bodyEndHtml = byPlacement.body_end.join('\n');
  
  // Handed to PageScriptLoader so it can skip re-injecting (and re-executing)
  // scripts that are already part of this SSR'd markup, on the same pathname.
  const initialScriptIds = matchedScripts.map((script) => script.id);

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      {headHtml && (
        <head suppressHydrationWarning dangerouslySetInnerHTML={{ __html: headHtml }} />
      )}
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

        {bodyStartHtml && (
          <div
            suppressHydrationWarning
            data-page-scripts="body_start"
            dangerouslySetInnerHTML={{ __html: bodyStartHtml }}
          />
        )}

        <PageScriptLoader initialPathname={pathname} initialScriptIds={initialScriptIds} />

        <AuthProvider>
          <LocationProvider>
            <SiteContentProvider footer={footer}>
              {children}
            </SiteContentProvider>
          </LocationProvider>
        </AuthProvider>

        {bodyEndHtml && (
          <div
            suppressHydrationWarning
            data-page-scripts="body_end"
            dangerouslySetInnerHTML={{ __html: bodyEndHtml }}
          />
        )}
      </body>
    </html>
  );
}
