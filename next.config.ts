import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
  turbopack: {
    resolveAlias: {
      fs: './src/shared/utils/empty.ts',
    },
  },
};

export default nextConfig;
