"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Building2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function LoginCorretorPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (document.cookie.includes("token=")) {
      router.replace("/corretor/painel")
    }
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      })

      if (!res.ok) throw new Error("Email ou senha incorretos")

      const { token, email: emailRetornado } = await res.json()

      // Cookie já definido pelo servidor via Set-Cookie no response acima
      localStorage.setItem("token", token)
      localStorage.setItem("corretorLogado", JSON.stringify({ email: emailRetornado }))

      window.location.href = "/corretor/painel"
    } catch {
      setError("Email ou senha incorretos")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <Building2 className="mx-auto h-10 w-10" />
          <h1 className="text-2xl font-bold">Área Administrativa</h1>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border p-2"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded border p-2 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}
