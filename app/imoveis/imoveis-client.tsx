"use client"

import { WifiOff } from "lucide-react"
import { PropertyCard } from "@/components/property-card"
import type { Imovel } from "@/lib/data"

interface Filtros {
  q: string
  tipo: string
  quartos: string
  ord: string
}

interface Props {
  initialImoveis: Imovel[]
  filtros: Filtros
  apiDown?: boolean
}

export default function ImoveisClient({ initialImoveis, filtros, apiDown }: Props) {
  function autoSubmit(e: React.ChangeEvent<HTMLSelectElement>) {
    e.target.form?.submit()
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

      {/* FILTROS — form GET nativo, funciona sem JavaScript */}
      <section className="sticky top-16 z-30 border-b bg-background py-4">
        <div className="container mx-auto px-4">
          <form method="GET" action="/imoveis" className="flex flex-col gap-3">

            {/* Linha de busca */}
            <div className="flex gap-2">
              <input
                type="text"
                name="q"
                defaultValue={filtros.q}
                placeholder="Buscar imóvel ou cidade..."
                className="h-11 flex-1 rounded-xl border bg-background px-4 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
              >
                Buscar
              </button>
            </div>

            {/* Selects — auto-submit ao mudar */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <select
                name="tipo"
                defaultValue={filtros.tipo}
                onChange={autoSubmit}
                className="h-11 rounded-xl border bg-background px-3 text-sm"
              >
                <option value="todos">Todos os tipos</option>
                <option value="venda">Venda</option>
                <option value="aluguel">Aluguel</option>
              </select>

              <select
                name="quartos"
                defaultValue={filtros.quartos}
                onChange={autoSubmit}
                className="h-11 rounded-xl border bg-background px-3 text-sm"
              >
                <option value="0">Quartos</option>
                <option value="1">1+ quarto</option>
                <option value="2">2+ quartos</option>
                <option value="3">3+ quartos</option>
                <option value="4">4+ quartos</option>
              </select>

              <select
                name="ord"
                defaultValue={filtros.ord}
                onChange={autoSubmit}
                className="h-11 rounded-xl border bg-background px-3 text-sm"
              >
                <option value="recentes">Mais recentes</option>
                <option value="menor-preco">Menor preço</option>
                <option value="maior-preco">Maior preço</option>
              </select>

              <a
                href="/imoveis"
                className="flex h-11 items-center justify-center rounded-xl border text-sm font-medium hover:bg-muted"
              >
                Limpar filtros
              </a>
            </div>

          </form>
        </div>
      </section>

      {/* RESULTADOS */}
      <section className="py-10">
        <div className="container mx-auto px-4">

          <p className="mb-6 text-muted-foreground">
            {initialImoveis.length} resultado{initialImoveis.length !== 1 ? "s" : ""}
          </p>

          {apiDown ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed py-20 text-center">
              <WifiOff className="mb-4 h-12 w-12 text-muted-foreground/60" />
              <h3 className="text-xl font-bold">API indisponível</h3>
              <p className="mt-2 max-w-sm text-muted-foreground">
                Não foi possível conectar à API. Verifique sua conexão.
              </p>
              <a
                href="/imoveis"
                className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
              >
                Tentar novamente
              </a>
            </div>
          ) : initialImoveis.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {initialImoveis.map((imovel) => (
                <PropertyCard key={imovel.id} imovel={imovel} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border py-20 text-center">
              <h3 className="text-2xl font-bold">Nenhum imóvel encontrado</h3>
              <p className="mt-2 text-muted-foreground">Tente alterar os filtros da busca.</p>
              <a
                href="/imoveis"
                className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
              >
                Limpar filtros
              </a>
            </div>
          )}

        </div>
      </section>

    </div>
  )
}
