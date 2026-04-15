"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, SlidersHorizontal, Building2, Home, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PropertyCard } from "@/components/property-card"
import { getImoveis } from "@/lib/data"

type TipoFiltro = "todos" | "venda" | "aluguel"

export default function ImoveisPage() {
  const [busca, setBusca] = useState("")
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>("todos")
  const [showFilters, setShowFilters] = useState(false)
  const [imoveis, setImoveis] = useState<any[]>([])

  // 🔥 CARREGA DO LOCALSTORAGE
  useEffect(() => {
    const dados = getImoveis()
    setImoveis(dados)
  }, [])

  const imoveisFiltrados = useMemo(() => {
    return imoveis.filter((imovel) => {
      const matchBusca =
        imovel.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        imovel.cidade.toLowerCase().includes(busca.toLowerCase())

      const matchTipo =
        tipoFiltro === "todos" || imovel.tipo === tipoFiltro

      return matchBusca && matchTipo
    })
  }, [busca, tipoFiltro, imoveis])

  const limparFiltros = () => {
    setBusca("")
    setTipoFiltro("todos")
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-border bg-card py-12">
        <div className="container mx-auto px-4">
          <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
            Encontre seu <span className="text-primary">Imóvel</span>
          </h1>
          <p className="text-muted-foreground">
            {imoveisFiltrados.length}{" "}
            {imoveisFiltrados.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border bg-background py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por cidade ou título..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full rounded-lg border border-border bg-input py-2 pl-10 pr-4"
              />
            </div>

            {/* Mobile botão */}
            <Button
              variant="outline"
              className="md:hidden gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
            </Button>

            {/* Desktop filtros */}
            <div className="hidden md:flex items-center gap-2">
              <Button onClick={() => setTipoFiltro("todos")}>Todos</Button>
              <Button onClick={() => setTipoFiltro("venda")}>Venda</Button>
              <Button onClick={() => setTipoFiltro("aluguel")}>Aluguel</Button>

              {(busca || tipoFiltro !== "todos") && (
                <Button variant="ghost" onClick={limparFiltros}>
                  <X className="h-4 w-4" />
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* Mobile filtros */}
          {showFilters && (
            <div className="mt-4 flex gap-2 md:hidden">
              <Button onClick={() => setTipoFiltro("todos")}>Todos</Button>
              <Button onClick={() => setTipoFiltro("venda")}>Venda</Button>
              <Button onClick={() => setTipoFiltro("aluguel")}>Aluguel</Button>
            </div>
          )}
        </div>
      </section>

      {/* LISTA */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {imoveisFiltrados.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {imoveisFiltrados.map((imovel) => (
                <PropertyCard key={imovel.id} imovel={imovel} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h2>Nenhum imóvel encontrado</h2>
              <Button onClick={limparFiltros}>Limpar filtros</Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}