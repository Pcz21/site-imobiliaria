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
  MessageCircle,
  BarChart2,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PropertyCard } from "@/components/property-card"
import { apiGetImoveis, apiDeletarImovel, isAdmin } from "@/lib/api"
import type { Imovel } from "@/lib/data"

export default function PainelCorretorPage() {
  const router = useRouter()

  const [meusImoveis, setMeusImoveis] = useState<Imovel[]>([])
  const [corretor, setCorretor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [removendoId, setRemovendoId] = useState<number | string | null>(null)
  const [ehAdmin, setEhAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    async function iniciar() {
      const allCookies = document.cookie
      const tokenMatch = allCookies.match(/(?:^|;\s*)token=([^;]+)/)
      const emailMatch = allCookies.match(/(?:^|;\s*)corretor_email=([^;]+)/)

      let emailCorretor = ""

      if (emailMatch) {
        const bruto = emailMatch[1]
        emailCorretor = (() => { try { return decodeURIComponent(bruto) } catch { return bruto } })()
        setCorretor({ email: emailCorretor })
      }

      if (!emailCorretor) {
        try {
          const dados = localStorage.getItem("corretorLogado")
          if (dados) {
            const user = JSON.parse(dados)
            emailCorretor = user.email || ""
            setCorretor(user)
          }
        } catch {}
      }

      if (!emailCorretor && !tokenMatch) {
        window.location.href = "/corretor/login"
        return
      }

      setEhAdmin(isAdmin())
      await carregarImoveis(emailCorretor)
    }
    iniciar()
  }, [])

  async function carregarImoveis(email: string) {
    setLoading(true)
    try {
      const data = await apiGetImoveis({ corretorEmail: email })
      setMeusImoveis(data)
    } catch {
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
    document.cookie = "token=; path=/; max-age=0"
    document.cookie = "corretor_email=; path=/; max-age=0"
    try { localStorage.removeItem("corretorLogado"); localStorage.removeItem("token") } catch {}
    router.replace("/")
  }

  const totalVisualizacoes = meusImoveis.reduce((t, im) => t + (im.visualizacoes || 0), 0)
  const totalLeads         = meusImoveis.reduce((t, im) => t + (im.leads || 0), 0)
  const totalAtivos        = meusImoveis.filter((im) => im.ativo !== false).length

  const dadosGrafico = meusImoveis
    .filter((im) => im.ativo !== false)
    .slice(0, 10)
    .map((im) => ({
      nome:  im.titulo.length > 18 ? im.titulo.slice(0, 18) + "…" : im.titulo,
      views: im.visualizacoes || 0,
      leads: im.leads || 0,
    }))

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
            <Button asChild className="gap-2">
              <Link href="/corretor/publicar">
                <Plus className="h-4 w-4" />
                Novo imóvel
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/imoveis">Ver site</Link>
            </Button>
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
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-2xl">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-primary/10 p-4">
                <Home className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Imóveis ativos</p>
                <p className="text-3xl font-bold">{totalAtivos}</p>
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
                <MessageCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Leads (WhatsApp)</p>
                <p className="text-3xl font-bold">{totalLeads}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-amber-500/10 p-4">
                <TrendingUp className="h-6 w-6 text-amber-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Conta</p>
                <p className="line-clamp-1 font-semibold">{corretor?.email}</p>
                {ehAdmin !== null && (
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    ehAdmin
                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {ehAdmin ? "Administrador" : "Corretor"}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* GRÁFICO DE DESEMPENHO */}
        {dadosGrafico.length > 0 && (
          <section className="mt-10">
            <div className="mb-4 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Desempenho dos imóveis</h2>
            </div>
            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={dadosGrafico}
                    margin={{ top: 10, right: 10, left: 0, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="nome"
                      tick={{ fontSize: 11 }}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip
                      formatter={(value, name) =>
                        name === "views"
                          ? [value, "Visualizações"]
                          : [value, "Leads (WhatsApp)"]
                      }
                    />
                    <Legend
                      formatter={(value) =>
                        value === "views" ? "Visualizações" : "Leads (WhatsApp)"
                      }
                      wrapperStyle={{ paddingTop: 16 }}
                    />
                    <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="leads" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </section>
        )}

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
                    <Link
                      href={`/corretor/editar/${imovel.id}`}
                      className="rounded-full bg-blue-500 p-2 text-white shadow-lg transition hover:scale-105 hover:bg-blue-600 inline-flex items-center justify-center"
                    >
                      <Pencil className="h-4 w-4" style={{ pointerEvents: "none" }} />
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
                      📱 {imovel.leads || 0} leads
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
                <Button asChild className="mt-6 gap-2">
                  <Link href="/corretor/publicar">
                    <Plus className="h-4 w-4" />
                    Publicar imóvel
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  )
}