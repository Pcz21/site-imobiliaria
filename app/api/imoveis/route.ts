import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5162"

export async function GET(request: NextRequest) {
  try {
    const qs = request.nextUrl.searchParams.toString()
    const url = `${API_URL}/api/imoveis${qs ? `?${qs}` : ""}`

    const controller = new AbortController()
    const timeoutId  = setTimeout(() => controller.abort(), 8000)
    try {
      const res = await fetch(url, { signal: controller.signal })
      if (!res.ok) return NextResponse.json([], { status: res.status })
      return NextResponse.json(await res.json())
    } finally {
      clearTimeout(timeoutId)
    }
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}

// Proxy autenticado — cria imóvel repassando o JWT (cookie HttpOnly) como Bearer
export async function POST(request: NextRequest) {
  const token = (await cookies()).get("token")?.value
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const body = await request.text()
  const res = await fetch(`${API_URL}/api/imoveis`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body,
  })
  const text = await res.text()
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  })
}