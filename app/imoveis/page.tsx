import type { Metadata } from "next"
import { apiGetImoveis } from "@/lib/api"
import type { Imovel } from "@/lib/data"
import ImoveisClient from "./imoveis-client"

// Sempre busca dados frescos da API — não usa cache de build
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Imóveis — Fabiju Imóveis",
  description: "Explore imóveis para compra, venda e aluguel. Casas, apartamentos e oportunidades exclusivas.",
}

export default async function ImoveisPage() {
  let imoveis: Imovel[] = []
  let apiDown = false

  try {
    imoveis = await apiGetImoveis()
  } catch {
    apiDown = true
  }

  return <ImoveisClient initialImoveis={imoveis} apiDown={apiDown} />
}
