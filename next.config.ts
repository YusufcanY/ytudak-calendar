import type { NextConfig } from "next";

const UMAMI_HOST =
  process.env.UMAMI_HOST ?? "https://rezervet-umami.3qidgo.easypanel.host";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/stats/script.js",
        destination: `${UMAMI_HOST}/script.js`,
      },
      {
        source: "/stats/api/send",
        destination: `${UMAMI_HOST}/api/send`,
      },
    ];
  },
};

export default nextConfig;
