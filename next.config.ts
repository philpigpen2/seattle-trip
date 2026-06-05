import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy philiplaney.com/IQ to the IQ UK Homes portfolio app (separate Vercel
  // project, served under its own basePath /IQ). Does not affect /trip.
  async rewrites() {
    return [
      {
        source: "/IQ",
        destination: "https://iq-uk-homes-portfolio.vercel.app/IQ",
      },
      {
        source: "/IQ/:path*",
        destination: "https://iq-uk-homes-portfolio.vercel.app/IQ/:path*",
      },
    ];
  },
};

export default nextConfig;