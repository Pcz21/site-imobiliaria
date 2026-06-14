"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, Building2, ArrowLeft, Loader2 } from "lucide-react"
import { PropertyCard } from "@/components/property-card"
import { Button } from "@/components/ui/button"
import { apiGetImovelById } from "@/lib/api"
import type { Imovel } from "@/lib/data"

export default function FavoritosPage() {
  const [imoveis, setImoveis]   = useState<Imovel[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function carregarFavoritos() {
      try {
        const ids: string[] = JSON.parse(localStorage.getItem("favoritos") ?? "[]") ?? []
        if (!Array.isArray(ids) || ids.length === 0) return
        const resultados = await Promise.allSettled(
          ids.map((id) => apiGetImovelById(Number(id)))
        )
        const validos = resultados
          .filter((r): r is PromiseFulfilledResult<Imovel | null> => r.status === "fulfilled")
          .map((r) => r.value)
          .filter((im): im is Imovel => im !== null)
        setImoveis(validos)
      } catch {}
      finally {
        setLoading(false)
      }
    }

    carregarFavoritos()
  }, [])

  function removerTodos() {
    localStorage.removeItem("favoritos")
    setImoveis([])
  }

  return (
    <div className="min-h-screen bg-background">

      {/* TOPO */}
      <section className="border-b bg-card py-4">
        <div className="container mx-auto px-4">
          <Link href="/imoveis" className="flex items-center gap-2 text-sm hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Ver todos os imóveis
          </Link>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold">
              <Heart className="h-7 w-7 fill-red-500 text-red-500" />
              Meus Favoritos
            </h1>
            <p className="mt-1 text-muted-foreground">
              {loading ? "Carregando..." : `${imoveis.length} imóvel${imoveis.length !== 1 ? "is" : ""} salvo${imoveis.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          {imoveis.length > 0 && (
            <Button variant="outline" size="sm" onClick={removerTodos} className="self-start sm:self-auto">
              Limpar favoritos
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : imoveis.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {imoveis.map((imovel) => (
              <PropertyCard key={imovel.id} imovel={imovel} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border py-24 text-center">
            <Building2 className="mb-5 h-14 w-14 text-muted-foreground/40" />
            <h2 className="text-2xl font-bold">Nenhum favorito ainda</h2>
            <p className="mt-2 max-w-sm text-muted-foreground">
              Toque no coração em qualquer imóvel para salvá-lo aqui.
            </p>
            <Button asChild className="mt-6">
              <Link href="/imoveis">Explorar imóveis</Link>
            </Button>
          </div>
        )}

      </div>
    </div>
  )
}
