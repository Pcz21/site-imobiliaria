import { NextRequest, NextResponse } from "next/server"

// URL interna da API .NET (runtime — NÃO usar NEXT_PUBLIC_, que congela no build).
const API_URL = process.env.API_URL ?? "http://localhost:5162"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Repassa IP/protocolo reais do cliente p/ a API (rate-limit de login por IP
    // atrás do Nginx). Em dev, esses headers não existem → comportamento inalterado.
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip")
    if (ip) headers["X-Forwarded-For"] = ip
    const xfProto = request.headers.get("x-forwarded-proto")
    if (xfProto) headers["X-Forwarded-Proto"] = xfProto

    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      return NextResponse.json({ error: "Email ou senha incorretos" }, { status: 401 })
    }

    const { token, email } = await res.json()

    const response = NextResponse.json({ token, email })

    // Secure só em HTTPS (produção). Em HTTP local/LAN o navegador rejeitaria
    // cookies Secure — manter condicional preserva o login no celular.
    const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "")
    const isHttps = proto === "https"

    // token: HttpOnly — nunca exposto ao JavaScript (proteção contra XSS)
    response.cookies.set({
      name: "token",
      value: token,
      path: "/",
      maxAge: 24 * 60 * 60,
      sameSite: "lax",
      httpOnly: true,
      secure: isHttps,
    })

    // corretor_email: legível pelo cliente (não é segredo) — sinaliza sessão ativa
    response.cookies.set({
      name: "corretor_email",
      value: email,
      path: "/",
      maxAge: 24 * 60 * 60,
      sameSite: "lax",
      httpOnly: false,
      secure: isHttps,
    })

    return response
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}