import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5162"

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