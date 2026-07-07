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
      // frame-src ÚNICO (CSP ignora a diretiva repetida): mapa do Google + iframe do HubSpot
      "frame-src 'self' https://maps.google.com https://www.google.com https://*.hsforms.com https://*.hsforms.net https://*.hubspot.com",
      "font-src 'self' data:",
      "connect-src 'self' https: http:",
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
