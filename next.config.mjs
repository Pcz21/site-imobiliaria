const isProd = process.env.NODE_ENV === "production"

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // HubSpot (formulário CRM): script de embed + analytics de formulários
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.hsforms.net https://js.hscollectedforms.net https://js.hs-banner.com https://js.hs-analytics.net",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https: http:",
      "font-src 'self' data:",
      "connect-src 'self' https: http:",
      // O formulário do HubSpot renderiza dentro de um iframe próprio
      "frame-src 'self' https://*.hsforms.com https://*.hsforms.net https://*.hubspot.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
]

// HSTS só em produção (HTTPS) — evita forçar https em dev/localhost
if (isProd) {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  })
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.0.40"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "daocwjnctmytnapcmfkq.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
}

export default nextConfig
