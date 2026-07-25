/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // Allow the app to be served from any subdomain of nearmee.net
  // This is required for business subdomain routing (e.g. pizza-hut.nearmee.net)
  async headers() {
    return [];
  },

  // Incomplete location URLs are not standalone listing pages — a valid listing
  // is /[country]/[state]/[city]/[category]. Anything shorter (country-only,
  // state-only, or city-only) is redirected to the home page with a real HTTP
  // 307 so nothing renders and no duplicate content is served.
  // The country segment is constrained to a 2-letter code ([a-z]{2}) so these
  // rules can never shadow real top-level routes (/login, /search, /category…).
  async redirects() {
    return [
      { source: '/:country([a-z]{2})', destination: '/', permanent: false },
      { source: '/:country([a-z]{2})/:state', destination: '/', permanent: false },
      { source: '/:country([a-z]{2})/:state/:city', destination: '/', permanent: false },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nearmee.net',
      },
      {
        protocol: 'https',
        hostname: '**.nearmee.net',
      },
      {
        protocol: 'http',
        hostname: 'web', // Internal Docker name for Django
        port: '8000',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      //{
      //  protocol: 'https',
      //  hostname: 'unrisen-abbie-attentively.ngrok-free.dev',
      //},
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;