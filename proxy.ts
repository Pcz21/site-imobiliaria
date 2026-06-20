import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const path  = request.nextUrl.pathname

  console.log("[MIDDLEWARE] Rota protegida:", path)
  console.log("[MIDDLEWARE] Cookie 'token':", token ? `presente (${token.slice(0, 20)}...)` : "AUSENTE")
  console.log("[MIDDLEWARE] Todos os cookies:", request.cookies.toString().slice(0, 200))

  if (!token) {
    console.log("[MIDDLEWARE] BLOQUEADO — sem token → redir login")
    return NextResponse.redirect(new URL("/corretor/login", request.url))
  }

  console.log("[MIDDLEWARE] PERMITIDO — passando para a rota")
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/corretor/painel",
    "/corretor/publicar",
    "/corretor/editar/:path*",
  ],
}
