/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // @react-pdf/renderer must be treated as an external on the server bundle.
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },
  async headers() {
    // Allow the questionnaire + report routes to be embedded in a WordPress page via iframe.
    const embedHost = process.env.WORDPRESS_EMBED_ORIGIN || "*";
    return [
      {
        source: "/embed/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors 'self' ${embedHost};`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
