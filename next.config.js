/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Public widget pages must be embeddable in a Notion iframe.
        source: "/w/:path*",
        headers: [
          { key: "X-Frame-Options", value: "ALLOWALL" },
          { key: "Content-Security-Policy", value: "frame-ancestors *;" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
