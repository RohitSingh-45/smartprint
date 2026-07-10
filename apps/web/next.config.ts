import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // pdfjs-dist uses browser canvas APIs; avoid Node canvas polyfill resolution.
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
