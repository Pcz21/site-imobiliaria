"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Search,
  SlidersHorizontal,
  X,
  BedDouble,
  ArrowUpDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PropertyCard } from "@/components/property-card"
import { apiGetImoveis } from "@/lib/api"
import type { Imovel } from "@/lib/data"

type TipoFiltro = "todos" | "venda" | "aluguel"
type Ordenacao  = "recentes" | "menor-preco" | "maior-preco"

export default function ImoveisPage() {
  const [busca, setBusca]               = useState("")
  const [tipoFiltro, setTipoFiltro]     = useState<TipoFiltro>("todos")
  const [ordenacao, setOrdenacao]       = useState<Ordenacao>("recentes")
  const [quartosFiltro, setQuartosFiltro] = useState(0)
  const [precoMaximo, setPrecoMaximo]   = useState("")
  const [showFilters, setShowFilters]   = useState(false)
  const [imoveis, setImoveis]           = useState<Imovel[]>([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    async function carregarImoveis() {
      try {
        setLoading(true)
        const data = await apiGetImoveis()
        setImoveis(data)
      } catch (err) {
        console.error(err)
        setImoveis([])
      } finally {
        setLoading(false)
      }
    }
    carregarImoveis()
  }, [])

  const imoveisFiltrados = useMemo(() => {
    let lista = [...imoveis]

    lista = lista.filter((imovel) => {
      const titulo     = imovel?.titulo?.toLowerCase() || ""
      const cidade     = imovel?.cidade?.toLowerCase() || ""
      const buscaTexto = busca.toLowerCase()

      const matchBusca   = titulo.includes(buscaTexto) || cidade.includes(buscaTexto)
      const matchTipo    = tipoFiltro === "todos" || imovel.tipo === tipoFiltro
      const matchQuartos = quartosFiltro === 0 || (imovel.quartos || 0) >= quartosFiltro
      const matchPreco   = !precoMaximo || imovel.preco <= Number(precoMaximo)

      return matchBusca && matchTipo && matchQuartos && matchPreco
    })

    switch (ordenacao) {
      case "menor-preco":
        lista.sort((a, b) => a.preco - b.preco)
        break
      case "maior-preco":
        lista.sort((a, b) => b.preco - a.preco)
        break
      default:
        lista.sort(
          (a, b) =>
            new Date(b.created_at || "").getTime() -
            new Date(a.created_at || "").getTime()
        )
    }

    return lista
  }, [busca, tipoFiltro, quartosFiltro, precoMaximo, ordenacao, imoveis])

  function limparFiltros() {
    setBusca("")
    setTipoFiltro("todos")
    setOrdenacao("recentes")
    setQuartosFiltro(0)
    setPrecoMaximo("")
  }

  return (
    <div className="min-h-screen bg-background">

      {/* HERO */}
      <section className="border-b bg-card py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Encontre seu{" "}
              <span className="text-primary">imóvel ideal</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Explore imóveis modernos, casas, apartamentos e oportunidades exclusivas.
            </p>
          </div>
        </div>
      </section>

      {/* FILTROS — sticky abaixo do header */}
      <section
        className="sticky top-16 z-30 border-b bg-background/95"
        style={{ WebkitBackdropFilter: "blur(10px)", backdropFilter: "blur(10px)" }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">

            {/* BUSCA */}
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar imóvel ou cidade..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="h-11 w-full rounded-xl border bg-background pl-10 pr-4 outline-none transition focus:border-primary"
                />
              </div>
              <Button
                variant="outline"
                className="gap-2 lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
              </Button>
            </div>

            {/* FILTROS */}
            <div
              className={`grid gap-3 md:grid-cols-2 xl:grid-cols-5 ${
                showFilters ? "grid" : "hidden lg:grid"
              }`}
            >
              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value as TipoFiltro)}
                className="h-11 rounded-xl border bg-background px-4"
              >
                <option value="todos">Todos</option>
                <option value="venda">Venda</option>
                <option value="aluguel">Aluguel</option>
              </select>

              <select
                value={quartosFiltro}
                onChange={(e) => setQuartosFiltro(Number(e.target.value))}
                className="h-11 rounded-xl border bg-background px-4"
              >
                <option value={0}>Quartos</option>
                <option value={1}>1+ quarto</option>
                <option value={2}>2+ quartos</option>
                <option value={3}>3+ quartos</option>
                <option value={4}>4+ quartos</option>
              </select>

              <input
                type="number"
                placeholder="Preço máximo"
                value={precoMaximo}
                onChange={(e) => setPrecoMaximo(e.target.value)}
                className="h-11 rounded-xl border bg-background px-4"
              />

              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
                className="h-11 rounded-xl border bg-background px-4"
              >
                <option value="recentes">Mais recentes</option>
                <option value="menor-preco">Menor preço</option>
                <option value="maior-preco">Maior preço</option>
              </select>

              <Button variant="outline" onClick={limparFiltros} className="h-11 gap-2">
                <X className="h-4 w-4" />
                Limpar
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* RESULTADOS */}
      <section className="py-10">
        <div className="container mx-auto px-4">

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Imóveis encontrados</h2>
              <p className="text-muted-foreground">{imoveisFiltrados.length} resultados</p>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-[360px] animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : imoveisFiltrados.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {imoveisFiltrados.map((imovel) => (
                <PropertyCard key={imovel.id} imovel={imovel} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border py-20 text-center">
              <BedDouble className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-2xl font-bold">Nenhum imóvel encontrado</h3>
              <p className="mt-2 text-muted-foreground">Tente alterar os filtros da busca.</p>
              <Button onClick={limparFiltros} className="mt-6">
                Limpar filtros
              </Button>
            </div>
          )}

        </div>
      </section>

    </div>
  )
}
