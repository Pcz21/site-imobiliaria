import type { Metadata } from "next"
import { apiGetImovelById } from "@/lib/api"
import { formatarPreco } from "@/lib/data"
import DetalhesLoader from "./detalhes-loader"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const imovel = await apiGetImovelById(Number(id)).catch(() => null)

  if (!imovel) {
    return { title: "Imóvel não encontrado — Fabiju Imóveis" }
  }

  const preco      = formatarPreco(imovel.preco, imovel.tipo)
  const descricao  = imovel.descricao
    ? imovel.descricao.slice(0, 155) + (imovel.descricao.length > 155 ? "…" : "")
    : `${imovel.tipo === "venda" ? "À venda" : "Para alugar"} em ${imovel.cidade} — ${preco}`
  const imagem     = imovel.imagens?.[0] || imovel.imagem

  return {
    title:       `${imovel.titulo} — Fabiju Imóveis`,
    description: descricao,
    openGraph: {
      title:       imovel.titulo,
      description: descricao,
      type:        "website",
      locale:      "pt_BR",
      images:      imagem ? [{ url: imagem, width: 1200, height: 630, alt: imovel.titulo }] : [],
    },
    twitter: {
      card:        "summary_large_image",
      title:       imovel.titulo,
      description: descricao,
      images:      imagem ? [imagem] : [],
    },
  }
}

export default async function ImovelDetalhesPage({ params }: Props) {
  const { id } = await params
  const imovel = await apiGetImovelById(Number(id)).catch(() => null)
  return <DetalhesLoader imovel={imovel} />
}