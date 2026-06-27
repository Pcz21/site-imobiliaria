import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PAGINA_LOGIN = "/corretor/login"

// base64url → bytes (compatível com Edge runtime, sem Buffer)
function b64urlParaBytes(s: string): Uint8Array {
  s = s.replace(/-/g, "+").replace(/_/g, "/")
  const resto = s.length % 4
  if (resto) s += "=".repeat(4 - resto)
  const bin = atob(s)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

function decodificarPayload(token: string): Record<string, unknown> | null {
  const partes = token.split(".")
  if (partes.length !== 3) return null
  try {
    return JSON.parse(new TextDecoder().decode(b64urlParaBytes(partes[1])))
  } catch {
    return null
  }
}

function expirado(payload: Record<string, unknown> | null): boolean {
  return typeof payload?.exp === "number" && Date.now() / 1000 >= (payload.exp as number)
}

// Verificação de assinatura HMAC-SHA256 via Web Crypto (defesa contra token forjado)
async function assinaturaValida(token: string, secret: string): Promise<boolean> {
  const partes = token.split(".")
  if (partes.length !== 3) return false
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    )
    return await crypto.subtle.verify(
      "HMAC",
      key,
      b64urlParaBytes(partes[2]),
      new TextEncoder().encode(`${partes[0]}.${partes[1]}`),
    )
  } catch {
    return false
  }
}

export default async function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value

  // 1) Sem token → bloqueia
  if (!token) {
    return NextResponse.redirect(new URL(PAGINA_LOGIN, request.url))
  }

  // 2) Estrutura inválida ou expirado → bloqueia
  const payload = decodificarPayload(token)
  if (!payload || expirado(payload)) {
    return NextResponse.redirect(new URL(PAGINA_LOGIN, request.url))
  }

  // 3) Assinatura — exige JWT_SECRET igual ao do backend.
  //    Sem o segredo configurado, valida apenas estrutura/expiração (sem travar o acesso).
  const secret = process.env.JWT_SECRET
  if (secret && !(await assinaturaValida(token, secret))) {
    return NextResponse.redirect(new URL(PAGINA_LOGIN, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/corretor/painel",
    "/corretor/publicar",
    "/corretor/leads",
    "/corretor/editar/:path*",
  ],
}