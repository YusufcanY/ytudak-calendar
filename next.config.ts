import type { NextConfig } from "next";

// `||` (not `??`): Docker sets unset build args to "", which must fall back too.
const UMAMI_HOST =
  process.env.UMAMI_HOST || "https://rezervet-umami.3qidgo.easypanel.host";

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
