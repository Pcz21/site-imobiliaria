import { NextRequest, NextResponse } from "next/server"

// URL interna da API .NET (runtime — NÃO usar NEXT_PUBLIC_, que congela no build).
const API_URL = process.env.API_URL ?? "http://localhost:5162"

// Proxy público — registra 1 visualização do imóvel na API .NET.
// Quem decide QUANDO contar é a página de detalhes (sem sessão + dedupe local).
export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const res = await fetch(`${API_URL}/api/imoveis/${id}/visualizacoes`, {
      method: "POST",
      cache: "no-store",
    })
    return new NextResponse(null, { status: res.status })
  } catch {
    return new NextResponse(null, { status: 500 })
  }
}
