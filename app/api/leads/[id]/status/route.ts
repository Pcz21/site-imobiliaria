import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// URL interna da API .NET (runtime — NÃO usar NEXT_PUBLIC_, que congela no build).
const API_URL = process.env.API_URL ?? "http://localhost:5162"

// PATCH protegido — atualiza o status de um lead (JWT do cookie HttpOnly → Bearer).
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = (await cookies()).get("token")?.value
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const { id } = await params
  const body = await request.text()
  try {
    const res = await fetch(`${API_URL}/api/leads/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body,
    })
    const text = await res.text()
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
    })
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar status" }, { status: 502 })
  }
}
