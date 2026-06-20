import type { Metadata } from "next"
import { apiGetImoveis } from "@/lib/api"
import type { Imovel } from "@/lib/data"
import ImoveisLoader from "./imoveis-loader"

export const metadata: Metadata = {
  title: "Imóveis — Fabiju Imóveis",
  description: "Explore imóveis para compra, venda e aluguel. Casas, apartamentos e oportunidades exclusivas.",
}

type SP = { q?: string; tipo?: string; quartos?: string; ord?: string }
type Props = { searchParams: Promise<SP> }

export default async function ImoveisPage({ searchParams }: Props) {
  const sp = await searchParams
  const q       = (sp.q       || "").toLowerCase()
  const tipo    = (sp.tipo    || "todos").toLowerCase()
  const quartos = Number(sp.quartos) || 0
  const ord     = sp.ord || "recentes"

  let imoveis: Imovel[] = []
  let apiDown = false

  try {
    imoveis = await apiGetImoveis()
  } catch {
    apiDown = true
  }

  // Filtragem server-side — zero React state, zero hydration mismatch
  let lista = [...imoveis]

  if (q) lista = lista.filter(im =>
    (im.titulo?.toLowerCase() || "").includes(q) ||
    (im.cidade?.toLowerCase() || "").includes(q)
  )
  if (tipo !== "todos") lista = lista.filter(im =>
    (im.tipo?.toLowerCase() || "") === tipo
  )
  if (quartos > 0) lista = lista.filter(im => (im.quartos || 0) >= quartos)

  if (ord === "menor-preco") lista.sort((a, b) => a.preco - b.preco)
  else if (ord === "maior-preco") lista.sort((a, b) => b.preco - a.preco)
  else lista.sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0
    const db = b.created_at ? new Date(b.created_at).getTime() : 0
    return db - da
  })

  return (
    <ImoveisLoader
      initialImoveis={lista}
      apiDown={apiDown}
      filtros={{
        q:       sp.q       || "",
        tipo:    tipo,
        quartos: sp.quartos || "0",
        ord:     ord,
      }}
    />
  )
}
