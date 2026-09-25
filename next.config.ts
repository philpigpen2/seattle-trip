import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // IQ UK Homes moved from philiplaney.com/IQ (a rewrite into its /IQ basePath)
  // to the root of its own subdomain. Old bookmarks and links, including
  // lowercase /iq (Next matches sources case-insensitively), redirect permanently.
  // Does not affect /trip.
  async redirects() {
    return [
      {
        source: "/IQ",
        destination: "https://iq.philiplaney.com/",
        permanent: true,
      },
      {
        source: "/IQ/:path*",
        destination: "https://iq.philiplaney.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
