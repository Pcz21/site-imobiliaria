import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// URL interna da API .NET (runtime — NÃO usar NEXT_PUBLIC_, que congela no build).
const API_URL = process.env.API_URL ?? "http://localhost:5162"

// POST público — registra um lead. Encaminha ao .NET sem autenticação.
// Roteia pelo proxy (mesma origem) para funcionar em qualquer dispositivo da LAN.
export async function POST(request: NextRequest) {
  const body = await request.text()
  try {
    const res = await fetch(`${API_URL}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    })
    const text = await res.text()
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
    })
  } catch {
    return NextResponse.json(
      { mensagem: "Não foi possível enviar seu contato. Tente novamente." },
      { status: 502 },
    )
  }
}

// GET protegido — lista leads, injetando o JWT do cookie HttpOnly como Bearer.
export async function GET(request: NextRequest) {
  const token = (await cookies()).get("token")?.value
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const qs = request.nextUrl.searchParams.toString()
  const url = `${API_URL}/api/leads${qs ? `?${qs}` : ""}`

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const text = await res.text()
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
    })
  } catch {
    return NextResponse.json({ error: "Erro ao carregar leads" }, { status: 502 })
  }
}
