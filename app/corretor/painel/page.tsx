"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Building2, Plus, ShoppingCart, LogOut, FileText, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PropertyCard } from "@/components/property-card"

export default function PainelCorretorPage() {
  const router = useRouter()

  const [anunciosDisponiveis] = useState(3)
  const [meusImoveis, setMeusImoveis] = useState<any[]>([])
  const [corretor, setCorretor] = useState<any>(null)

  // 🔥 carregar dados do usuário
  useEffect(() => {
    const dadosCorretor = localStorage.getItem("corretor")

    if (!dadosCorretor) {
      router.push("/corretor/login")
      return
    }

    const user = JSON.parse(dadosCorretor)
    setCorretor(user)

    const todosImoveis = JSON.parse(localStorage.getItem("imoveis") || "[]")

    // 🔥 FILTRA só os imóveis do corretor
    const meus = todosImoveis.filter(
      (imovel: any) => imovel.corretorEmail === user.email
    )

    setMeusImoveis(meus)
  }, [])

  // ❌ remover imóvel
  const removerImovel = (id: string) => {
    const todos = JSON.parse(localStorage.getItem("imoveis") || "[]")

    const novaLista = todos.filter((imovel: any) => imovel.id !== id)

    localStorage.setItem("imoveis", JSON.stringify(novaLista))

    // atualiza tela
    const meus = novaLista.filter(
      (imovel: any) => imovel.corretorEmail === corretor.email
    )

    setMeusImoveis(meus)
  }

  // 🚪 logout REAL
  const logout = () => {
    localStorage.removeItem("corretor")
    router.push("/")
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-border bg-card py-8">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              Painel do <span className="text-primary">Corretor</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie seus imóveis
            </p>
          </div>

          <Button onClick={logout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">

        {/* Cards */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm">Anúncios Ativos</p>
                <p className="text-2xl font-bold">{meusImoveis.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <Building2 className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm">Disponíveis</p>
                <p className="text-2xl font-bold">{anunciosDisponiveis}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-6 w-6 text-primary" />
                <span>Comprar anúncios</span>
              </div>
              <Button size="sm">Comprar</Button>
            </CardContent>
          </Card>
        </div>

        {/* Ações */}
        <div className="mt-8 flex gap-4">
          <Link href="/corretor/publicar">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Publicar
            </Button>
          </Link>

          <Link href="/imoveis">
            <Button variant="outline">
              Ver Imóveis
            </Button>
          </Link>
        </div>

        {/* Lista */}
        <section className="mt-12">
          <h2 className="mb-6 text-xl font-bold">Meus Imóveis</h2>

          {meusImoveis.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {meusImoveis.map((imovel) => (
                <div key={imovel.id} className="relative">

                  <PropertyCard imovel={imovel} />

                  {/* excluir */}
                  <button
                    onClick={() => removerImovel(imovel.id)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                </div>
              ))}
            </div>
          ) : (
            <p>Nenhum imóvel publicado</p>
          )}
        </section>
      </div>
    </div>
  )
}