"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--input)",
  color: "var(--foreground)",
  fontSize: 16,
  boxSizing: "border-box",
}

export default function LoginForm() {
  const router = useRouter()
  const [erro, setErro] = useState("")
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro("")

    const form = e.currentTarget
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const senha = (form.elements.namedItem("senha") as HTMLInputElement).value

    try {
      setEnviando(true)

      // POST JSON → a resposta seta os cookies (token HttpOnly + corretor_email)
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
        credentials: "same-origin",
        cache: "no-store",
      })

      if (res.status === 401) {
        setErro("Email ou senha incorretos")
        return
      }
      if (!res.ok) {
        setErro("Não foi possível entrar. Tente novamente.")
        return
      }

      // Cookies já aplicados pela resposta. Navega ao painel e atualiza os
      // Server Components (RootLayout/header passam a ver a sessão ativa).
      router.replace("/corretor/painel")
      router.refresh()
    } catch {
      setErro("Erro ao conectar. Verifique sua conexão.")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {erro && (
        <p style={{ color: "#ef4444", fontSize: 14, margin: 0 }}>{erro}</p>
      )}

      <input type="email" name="email" placeholder="Email" required autoComplete="email" style={inputStyle} />
      <input type="password" name="senha" placeholder="Senha" required autoComplete="current-password" style={inputStyle} />

      <button
        type="submit"
        disabled={enviando}
        style={{
          width: "100%",
          padding: "11px 0",
          borderRadius: 8,
          background: "var(--primary)",
          color: "var(--primary-foreground)",
          fontWeight: 600,
          fontSize: 15,
          border: "none",
          cursor: enviando ? "default" : "pointer",
          opacity: enviando ? 0.7 : 1,
        }}
      >
        {enviando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  )
}
