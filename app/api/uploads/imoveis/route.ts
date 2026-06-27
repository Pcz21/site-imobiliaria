import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5162"

// Proxy autenticado de upload — repassa o multipart e injeta o JWT (cookie HttpOnly)
export async function POST(request: NextRequest) {
  const token = (await cookies()).get("token")?.value
  if (!token) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 })

  const formData = await request.formData()
  const res = await fetch(`${API_URL}/api/uploads/imoveis`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  const text = await res.text()
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  })
}