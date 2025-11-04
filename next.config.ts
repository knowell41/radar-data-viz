import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker optimization
  output: 'standalone',
  
  // Additional optimizations
  experimental: {
    // Reduce bundle size by tree-shaking unused code
    optimizePackageImports: ['leaflet', 'next-themes'],
  },
  
  // Compress images
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  
  // Bundle analyzer (uncomment for debugging)
  // bundlePagesRouterDependencies: true,
};

export default nextConfig;
