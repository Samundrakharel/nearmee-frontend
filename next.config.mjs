/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nearmee.net',
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