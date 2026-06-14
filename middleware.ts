import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/corretor/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/corretor/painel",
    "/corretor/publicar",
    "/corretor/editar/:path*",
  ],
}
