import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Building2 } from "lucide-react"

type Props = { searchParams: Promise<{ erro?: string }> }

export default async function LoginCorretorPage({ searchParams }: Props) {
  // Redireciona server-side se já estiver logado (sem round-trip de JavaScript)
  const cookieStore = await cookies()
  if (cookieStore.get("token")?.value) redirect("/corretor/painel")

  const { erro } = await searchParams

  return (
    <div style={{ display: "flex", minHeight: "80vh", alignItems: "center", justifyContent: "center", padding: "48px 16px" }}>
      <div style={{ width: "100%", maxWidth: 420, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 32 }}>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Building2 style={{ margin: "0 auto 12px", width: 40, height: 40 }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Área Administrativa</h1>
        </div>

        <form action="/api/auth/login-redirect" method="POST" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {erro === "credenciais" && (
            <p style={{ color: "#ef4444", fontSize: 14, margin: 0 }}>Email ou senha incorretos</p>
          )}
          {erro === "conexao" && (
            <p style={{ color: "#ef4444", fontSize: 14, margin: 0 }}>Erro ao conectar. Verifique sua conexão.</p>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--input)",
              color: "var(--foreground)",
              fontSize: 16,
              boxSizing: "border-box",
            }}
          />

          <input
            type="password"
            name="senha"
            placeholder="Senha"
            required
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--input)",
              color: "var(--foreground)",
              fontSize: 16,
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "11px 0",
              borderRadius: 8,
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              fontWeight: 600,
              fontSize: 15,
              border: "none",
              cursor: "pointer",
            }}
          >
            Entrar
          </button>

        </form>
      </div>
    </div>
  )
}