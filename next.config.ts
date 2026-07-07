import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://marshharriercowley.co.uk https://cdn.sanity.io https://*.cdninstagram.com https://*.fbcdn.net",
      "connect-src 'self' https://formspree.io https://api.sanity.io https://*.sanity.io wss://*.sanity.io",
      "frame-src https://www.google.com https://maps.google.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

// Sanity Studio needs a much looser policy: its own CDN scripts, workers,
// websockets, and third-party asset previews all fall outside the public
// site's locked-down CSP above.
const studioSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://core.sanity-cdn.com https://*.sanity.io",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "worker-src 'self' blob:",
      "img-src 'self' data: blob: https: http:",
      "media-src 'self' data: blob: https:",
      "connect-src 'self' https://api.sanity.io https://*.sanity.io wss://*.sanity.io https://core.sanity-cdn.com",
      "frame-src https:",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "marshharriercowley.co.uk",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/studio/:path*",
        headers: studioSecurityHeaders,
      },
    ];
  },
};

export default nextConfig;
