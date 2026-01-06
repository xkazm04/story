import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.leonardo.ai',
        pathname: '/**',
      },
    ],
  },
  webpack(config, options) {
    const { isServer } = options;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const NextFederationPlugin = require('@module-federation/nextjs-mf');

    config.plugins.push(
      new NextFederationPlugin({
        name: 'story',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          // Expose components here if needed in the future
        },
        shared: {
          // react: { singleton: true, eager: true, requiredVersion: false },
          // 'react-dom': { singleton: true, eager: true, requiredVersion: false },
        },
        extraOptions: {
          automaticAsyncBoundary: true,
        },
      })
    );

    return config;
  },
};

export default nextConfig;
