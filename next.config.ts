import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // For a user site (username.github.io), we don't need a basePath
  // But we need to ensure all paths are relative
  basePath: '',
  // Make sure asset paths are relative for GitHub Pages
  assetPrefix: './',
  images: {
    unoptimized: true,
  },
  // Disable trailing slashes for GitHub Pages compatibility
  trailingSlash: false,
  // Disable ESLint during production build
  eslint: {
    // Only run ESLint in development, not during builds
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during build
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
