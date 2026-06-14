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

    // Define o cookie via Set-Cookie header (mais confiável que document.cookie)
    response.cookies.set({
      name: "token",
      value: token,
      path: "/",
      maxAge: 24 * 60 * 60,
      sameSite: "lax",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
    })

    return response
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}