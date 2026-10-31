import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  cacheLife: {
    // How often product data is refreshed from the Google Sheet.
    catalogue: {
      stale: 60, // browsers may reuse a page for 1 minute
      revalidate: 300, // re-read the sheet in the background every 5 minutes
      expire: 86400, // if nobody visits for a day, the next visit waits for fresh data
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
