/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.tweedekamer.nl",
        pathname:
          "/sites/default/files/styles/*/public/tk_external_data_ggm_sync/photos/*",
      },
    ],
  },
  async redirects() {
    return [
      // ── Old TK routes → new /nl/tweede-kamer/ routes ──
      { source: "/beloften", destination: "/nl/tweede-kamer/beloften", permanent: true },
      { source: "/beloften/:id", destination: "/nl/tweede-kamer/beloften/:id", permanent: true },
      { source: "/moties", destination: "/nl/tweede-kamer/moties", permanent: true },
      { source: "/moties/:id", destination: "/nl/tweede-kamer/moties/:id", permanent: true },
      { source: "/kamerleden", destination: "/nl/tweede-kamer/kamerleden", permanent: true },
      { source: "/kamerleden/:id", destination: "/nl/tweede-kamer/kamerleden/:id", permanent: true },
      { source: "/partijen", destination: "/nl/tweede-kamer/partijen", permanent: true },
      { source: "/partijen/:id", destination: "/nl/tweede-kamer/partijen/:id", permanent: true },
      { source: "/verbinding", destination: "/nl/tweede-kamer/verbinding", permanent: true },
      { source: "/zoeken", destination: "/nl/tweede-kamer/zoeken", permanent: true },
    ];
  },
};

export default nextConfig;
