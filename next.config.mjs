/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Example for Unsplash images
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // Example for placeholder images
      },
    ],
    formats: ['image/avif', 'image/webp'], // Prioritize modern formats
  },
  // Add any other Next.js specific configurations here
  // For example, experimental features, redirects, headers, etc.
  experimental: {
    // appDir: true, // Already default in Next.js 13.4+
  },
  // If you plan to use a custom server, you might configure it here.
  // serverRuntimeConfig: {
  //   // Will only be available on the server side
  //   mySecret: 'secret',
  // },
  // publicRuntimeConfig: {
  //   // Will be available on both server and client
  //   staticFolder: '/static',
  // },
};

export default nextConfig; 