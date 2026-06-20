import { NextRequest, NextResponse } from "next/server"

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