"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  FileText,
  Trash2,
  LogOut,
  Pencil,
  Eye,
  MapPin,
  TrendingUp,
  Home,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PropertyCard } from "@/components/property-card"
import { apiGetImoveis, apiDeletarImovel } from "@/lib/api"
import type { Imovel } from "@/lib/data"

export default function PainelCorretorPage() {
  const router = useRouter()

  const [meusImoveis, setMeusImoveis] = useState<Imovel[]>([])
  const [corretor, setCorretor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [removendoId, setRemovendoId] = useState<number | string | null>(null)

  useEffect(() => {
    async function iniciar() {
      const dados = localStorage.getItem("corretorLogado")
      if (!dados) {
        router.replace("/corretor/login")
        return
      }
      const user = JSON.parse(dados)
      setCorretor(user)
      await carregarImoveis(user.email)
    }
    iniciar()
  }, [])

  async function carregarImoveis(email: string) {
    setLoading(true)
    try {
      const data = await apiGetImoveis({ corretorEmail: email })
      setMeusImoveis(data)
    } catch (err) {
      console.error(err)
      setMeusImoveis([])
    } finally {
      setLoading(false)
    }
  }

  async function removerImovel(id: number | string) {
    if (!confirm("Deseja realmente remover este imóvel?")) return

    try {
      setRemovendoId(id)
      await apiDeletarImovel(Number(id))
      if (corretor) await carregarImoveis(corretor.email)
    } catch (err) {
      console.error(err)
    } finally {
      setRemovendoId(null)
    }
  }

  function logout() {
    localStorage.removeItem("corretorLogado")
    localStorage.removeItem("token")
    document.cookie = "token=; path=/; max-age=0"
    router.replace("/")
  }

  const totalVisualizacoes = meusImoveis.reduce(
    (total, imovel) => total + (imovel.visualizacoes || 0),
    0
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Carregando painel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">

      {/* HEADER */}
      <section className="border-b bg-card">
        <div className="container mx-auto flex flex-col gap-6 px-4 py-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Painel <span className="text-primary">Administrativo</span>
            </h1>
            <p className="mt-2 text-muted-foreground">Gerencie seus imóveis publicados</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/corretor/publicar">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo imóvel
              </Button>
            </Link>
            <Link href="/imoveis">
              <Button variant="outline">Ver site</Button>
            </Link>
            <Button onClick={logout} variant="outline" className="gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </section>

      {/* CONTEÚDO */}
      <div className="container mx-auto px-4 py-10">

        {/* CARDS KPI */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="rounded-2xl">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-primary/10 p-4">
                <Home className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de imóveis</p>
                <p className="text-3xl font-bold">{meusImoveis.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-blue-500/10 p-4">
                <Eye className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Visualizações</p>
                <p className="text-3xl font-bold">{totalVisualizacoes}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-green-500/10 p-4">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conta</p>
                <p className="line-clamp-1 font-semibold">{corretor?.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* LISTA */}
        <section className="mt-12">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Meus imóveis</h2>
              <p className="text-muted-foreground">Gerencie seus anúncios</p>
            </div>
          </div>

          {meusImoveis.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {meusImoveis.map((imovel) => (
                <div key={imovel.id} className="group relative">
                  <PropertyCard imovel={imovel} />

                  {/* Ações — sempre visíveis no mobile */}
                  <div className="absolute right-3 top-3 z-30 flex gap-2 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                    <Link href={`/corretor/editar/${imovel.id}`}>
                      <button className="rounded-full bg-blue-500 p-2 text-white shadow-lg transition hover:scale-105 hover:bg-blue-600">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </Link>
                    <button
                      onClick={() => removerImovel(imovel.id)}
                      disabled={removendoId === imovel.id}
                      className="rounded-full bg-red-500 p-2 text-white shadow-lg transition hover:scale-105 hover:bg-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Badges */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <div className="rounded-full border px-3 py-1 text-xs">
                      👁️ {imovel.visualizacoes || 0} views
                    </div>
                    <div className="rounded-full border px-3 py-1 text-xs">
                      🖼️ {imovel.imagens?.length || 0} fotos
                    </div>
                    {(imovel.videos?.length ?? 0) > 0 && (
                      <div className="rounded-full border px-3 py-1 text-xs">
                        🎥 {imovel.videos?.length} vídeos
                      </div>
                    )}
                    <div className="rounded-full border px-3 py-1 text-xs">
                      <MapPin className="mr-1 inline h-3 w-3" />
                      {imovel.cidade}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="rounded-3xl border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <FileText className="mb-5 h-14 w-14 text-muted-foreground" />
                <h3 className="text-2xl font-bold">Nenhum imóvel publicado</h3>
                <p className="mt-2 max-w-md text-muted-foreground">
                  Comece criando seu primeiro anúncio imobiliário.
                </p>
                <Link href="/corretor/publicar" className="mt-6">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Publicar imóvel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  )
}
