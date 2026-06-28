import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// URL interna da API .NET (runtime — NÃO usar NEXT_PUBLIC_, que congela no build).
const API_URL = process.env.API_URL ?? "http://localhost:5162"

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const controller = new AbortController()
    const timeoutId  = setTimeout(() => controller.abort(), 8000)
    try {
      const res = await fetch(`${API_URL}/api/imoveis/${id}`, { signal: controller.signal })
      if (res.status === 404) return NextResponse.json(null, { status: 404 })
      if (!res.ok) return NextResponse.json(null, { status: res.status })
      return NextResponse.json(await res.json())
    } finally {
      clearTimeout(timeoutId)
    }
  } catch {
    return NextResponse.json(null, { status: 500 })
  }
}

// Proxy autenticado — atualiza imóvel (JWT do cookie HttpOnly → Bearer)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = (await cookies()).get("token")?.value
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const { id } = await params
  const body = await request.text()
  const res = await fetch(`${API_URL}/api/imoveis/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body,
  })
  const text = await res.text()
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  })
}

// Proxy autenticado — remove imóvel (soft delete na API)
export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = (await cookies()).get("token")?.value
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const { id } = await params
  const res = await fetch(`${API_URL}/api/imoveis/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 204) return new NextResponse(null, { status: 204 })
  const text = await res.text()
  return new NextResponse(text, { status: res.status })
}