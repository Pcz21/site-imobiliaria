import { NextRequest, NextResponse } from "next/server"

// Logout: limpa os cookies de sessão (incluindo o token HttpOnly, que o
// JavaScript não consegue apagar) e volta para a home.
export async function GET(request: NextRequest) {
  // Atrás do Nginx/Cloudflare, request.url é a URL interna (127.0.0.1:3000).
  // Monta a home a partir dos headers de proxy para não redirecionar a localhost.
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "")
  const host  = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host
  const response = NextResponse.redirect(`${proto}://${host}/`)
  response.cookies.set({ name: "token", value: "", path: "/", maxAge: 0 })
  response.cookies.set({ name: "corretor_email", value: "", path: "/", maxAge: 0 })
  return response
}