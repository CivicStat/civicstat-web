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
  async rewrites() {
    return [
      // ── PostHog reverse proxy (avoids ad blockers) ──
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://eu.i.posthog.com/decide",
      },
    ];
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
      // ── Formatie ──
      { source: "/formatie", destination: "/nl/formatie", permanent: true },
      { source: "/formatie/:slug", destination: "/nl/formatie/:slug", permanent: true },
      // ── Status → Transparantie ──
      { source: "/status", destination: "/transparantie", permanent: true },
      // ── Old singular gemeente → plural gemeenten ──
      { source: "/nl/gemeente", destination: "/nl/gemeenten", permanent: true },
      { source: "/nl/gemeente/:city", destination: "/nl/gemeenten/:city", permanent: true },
      { source: "/nl/gemeente/:city/:path*", destination: "/nl/gemeenten/:city/:path*", permanent: true },
    ];
  },
  // Prevent PostHog proxy rewrites from being blocked by middleware
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
