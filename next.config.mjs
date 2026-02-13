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
};

export default nextConfig;
