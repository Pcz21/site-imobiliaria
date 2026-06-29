import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Building2 } from "lucide-react"
import LoginForm from "./login-form"

export default async function LoginCorretorPage() {
  // Redireciona server-side se já estiver logado (sem round-trip de JavaScript)
  const cookieStore = await cookies()
  if (cookieStore.get("token")?.value) redirect("/corretor/painel")

  return (
    <div style={{ display: "flex", minHeight: "80vh", alignItems: "center", justifyContent: "center", padding: "48px 16px" }}>
      <div style={{ width: "100%", maxWidth: 420, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 32 }}>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Building2 style={{ margin: "0 auto 12px", width: 40, height: 40 }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Área Administrativa</h1>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}