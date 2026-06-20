import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5162"

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = (formData.get("email") as string) ?? ""
  const senha = (formData.get("senha") as string) ?? ""

  const base = request.nextUrl.origin

  if (!email || !senha) {
    return NextResponse.redirect(`${base}/corretor/login?erro=credenciais`, { status: 303 })
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
      cache: "no-store",
    })

    if (!res.ok) {
      return NextResponse.redirect(`${base}/corretor/login?erro=credenciais`, { status: 303 })
    }

    const body = await res.json()
    const token: string = body.token
    const emailRetornado: string = body.email

    // 303 See Other: força o browser a fazer GET no /corretor/painel após o POST
    // (307 repetiria o POST, quebrando em produção)
    const response = NextResponse.redirect(`${base}/corretor/painel`, { status: 303 })

    // Set-Cookie direto, sem encodeURIComponent: @ permanece @ no cookie
    // Assim document.cookie retorna spaulo456.com@gmail.com sem precisar de decode
    const maxAge = 24 * 60 * 60
    response.headers.append(
      "Set-Cookie",
      `token=${token}; Path=/; Max-Age=${maxAge}; SameSite=Lax`,
    )
    response.headers.append(
      "Set-Cookie",
      `corretor_email=${emailRetornado}; Path=/; Max-Age=${maxAge}; SameSite=Lax`,
    )
    return response
  } catch {
    return NextResponse.redirect(`${base}/corretor/login?erro=conexao`, { status: 303 })
  }
}