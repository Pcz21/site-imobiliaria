import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5162"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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