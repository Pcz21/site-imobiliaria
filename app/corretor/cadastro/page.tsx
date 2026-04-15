"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Building2, Mail, Lock, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function CadastroCorretorPage() {
  const router = useRouter()

  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const novoCorretor = {
      nome,
      email,
      senha,
    }

    localStorage.setItem("corretor", JSON.stringify(novoCorretor))

    setTimeout(() => {
      router.push("/corretor/login")
    }, 1000)
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Building2 className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Criar Conta
          </h1>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="text-sm">Nome</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="w-full pl-10 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="text-sm">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="text-sm">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="w-full pl-10 py-2 border rounded-lg"
                />
              </div>
            </div>

            <Button className="w-full" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar conta"}
            </Button>
          </form>

          <p className="text-center text-sm mt-4">
            Já tem conta?{" "}
            <Link href="/corretor/login" className="text-primary">
              Entrar
            </Link>
          </p>

        </CardContent>
      </Card>
    </div>
  )
}