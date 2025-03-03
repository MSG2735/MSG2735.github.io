import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // GitHub Pages uses the repository name as the base path
  // For a user site (username.github.io), we don't need a basePath
  basePath: '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  images: {
    unoptimized: true,
  },
  // Disable trailing slashes for GitHub Pages compatibility
  trailingSlash: false,
};

export default nextConfig;
