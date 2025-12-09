import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["jcurbelo.ngrok.app"],
  turbopack: {
    resolveAlias: {
      pino: "pino/browser",
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        pino: "pino/browser",
      };
    }
    return config;
  },
};

export default nextConfig;
