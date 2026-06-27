import { NextRequest, NextResponse } from "next/server"

// Logout: limpa os cookies de sessão (incluindo o token HttpOnly, que o
// JavaScript não consegue apagar) e volta para a home.
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url))
  response.cookies.set({ name: "token", value: "", path: "/", maxAge: 0 })
  response.cookies.set({ name: "corretor_email", value: "", path: "/", maxAge: 0 })
  return response
}