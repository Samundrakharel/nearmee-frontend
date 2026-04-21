/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // Allow the app to be served from any subdomain of nearmee.net
  // This is required for business subdomain routing (e.g. pizza-hut.nearmee.net)
  async headers() {
    return [];
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