"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft, Heart, Share2, MapPin, Bed, Bath, Maximize, Car, MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { LeadForm } from "@/components/lead-form"
import { type Imovel, WHATSAPP_OFICIAL } from "@/lib/data"

interface Props {
  imovel: Imovel | null
}

function formatPreco(preco: number, tipo: string): string {
  const s = Math.round(preco).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return tipo === "aluguel" ? `R$ ${s}/mês` : `R$ ${s}`
}

export default function ImovelDetalhesClient({ imovel }: Props) {
  const [favorito, setFavorito] = useState(false)

  useEffect(() => {
    if (!imovel) return
    try {
      const ids: string[] = JSON.parse(localStorage.getItem("favoritos") || "[]")
      setFavorito(ids.includes(String(imovel.id)))
    } catch {}
  }, [imovel])

  if (!imovel) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-xl font-semibold text-foreground">Imóvel não encontrado</p>
        <Link href="/imoveis" className="text-gold hover:underline">Ver todos os imóveis</Link>
      </div>
    )
  }

  const imagens = (imovel.imagens?.length ?? 0) > 0 ? imovel.imagens! : imovel.imagem ? [imovel.imagem] : []
  const videos  = imovel.videos || []

  const digits  = (imovel.whatsapp || "").replace(/\D/g, "")
  // Número do imóvel quando válido; senão, número oficial da Fabiju
  const phone   =
    digits.length === 10 || digits.length === 11 ? `55${digits}`
    : digits.length >= 12 ? digits
    : WHATSAPP_OFICIAL
  const msgWa   = encodeURIComponent(`Olá! Tenho interesse no imóvel: ${imovel.titulo}`)
  const waLink  = `https://wa.me/${phone}?text=${msgWa}`

  const shareLink = `https://wa.me/?text=${encodeURIComponent(`${imovel.titulo} - Fabiju Imóveis: /imoveis/${imovel.id}`)}`

  function toggleFavorito() {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem("favoritos") || "[]")
      const id = String(imovel!.id)
      const novos = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]
      localStorage.setItem("favoritos", JSON.stringify(novos))
      setFavorito(v => !v)
    } catch {}
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Barra de topo */}
      <div className="border-b bg-card">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link
            href="/imoveis"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggleFavorito}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition-colors ${
                favorito
                  ? "border-red-500 bg-red-500/10 text-red-500"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Heart className={`h-4 w-4 ${favorito ? "fill-red-500" : ""}`} />
              {favorito ? "Salvo" : "Salvar"}
            </button>
            <a
              href={shareLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Share2 className="h-4 w-4" />
              Compartilhar
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">

          {/* Coluna principal */}
          <div className="flex flex-col gap-10">

            {/* Galeria — CSS scroll-snap, sem estado React, funciona em qualquer mobile */}
            {imagens.length > 0 && (
              <div className="fade-in">
                <div className="flex aspect-[16/10] snap-x snap-mandatory overflow-x-auto rounded-xl bg-neutral-100 shadow-sm [-webkit-overflow-scrolling:touch]">
                  {imagens.map((img, i) => (
                    <div key={i} className="w-full shrink-0 snap-start">
                      <img
                        src={img}
                        alt={`${imovel.titulo} foto ${i + 1}`}
                        className="block h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                {imagens.length > 1 && (
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    deslize para ver as {imagens.length} fotos
                  </p>
                )}
              </div>
            )}

            {/* Título e localização */}
            <div>
              <h1 className="text-3xl font-medium tracking-tight md:text-4xl">{imovel.titulo}</h1>
              {imovel.cidade && (
                <p className="mt-3 flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-gold" />
                  {imovel.cidade}
                </p>
              )}
              {imovel.endereco && (
                <p className="mt-1 text-sm text-muted-foreground/80">{imovel.endereco}</p>
              )}
            </div>

            {/* Características */}
            {(imovel.quartos || imovel.banheiros || imovel.area || imovel.vagas) && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {imovel.quartos   ? <Stat Icon={Bed}      label="Quartos"   valor={String(imovel.quartos)} />   : null}
                {imovel.banheiros ? <Stat Icon={Bath}     label="Banheiros" valor={String(imovel.banheiros)} /> : null}
                {imovel.area      ? <Stat Icon={Maximize} label="Área"      valor={`${imovel.area} m²`} />      : null}
                {imovel.vagas     ? <Stat Icon={Car}      label="Vagas"     valor={String(imovel.vagas)} />     : null}
              </div>
            )}

            {/* Descrição */}
            {imovel.descricao && (
              <div>
                <h2 className="mb-3 text-xl font-semibold">Descrição</h2>
                <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{imovel.descricao}</p>
              </div>
            )}

            {/* Mapa */}
            {imovel.endereco && (
              <div>
                <h2 className="mb-3 text-xl font-semibold">Localização</h2>
                <div className="overflow-hidden rounded-xl border">
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(imovel.endereco)}&output=embed`}
                    width="100%"
                    height="300"
                    className="block border-0"
                    loading="lazy"
                    title="Mapa"
                  />
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(imovel.endereco)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm text-gold hover:underline"
                >
                  Abrir no Google Maps
                </a>
              </div>
            )}

            {/* Vídeos */}
            {videos.length > 0 && (
              <div>
                <h2 className="mb-3 text-xl font-semibold">Vídeos</h2>
                {videos.map((v, i) => (
                  <video key={i} controls className={`w-full rounded-xl ${i > 0 ? "mt-3" : ""}`}>
                    <source src={v} />
                  </video>
                ))}
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            <div className="sticky top-20 flex flex-col gap-5 rounded-2xl border bg-card p-6 shadow-sm">

              <div>
                <p className="text-sm text-muted-foreground">Valor do imóvel</p>
                <p className="mt-1.5 font-serif text-3xl font-semibold tracking-tight text-foreground">
                  {formatPreco(imovel.preco, imovel.tipo)}
                </p>
                <span
                  className={`mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${
                    imovel.tipo === "venda"
                      ? "bg-foreground/10 text-foreground"
                      : "bg-gold/15 text-gold"
                  }`}
                >
                  {imovel.tipo === "venda" ? "Venda" : "Aluguel"}
                </span>
              </div>

              {waLink && (
                <Button asChild size="lg" className="w-full gap-2 bg-green-600 text-base hover:bg-green-700">
                  <a href={waLink} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-5 w-5" />
                    Falar no WhatsApp
                  </a>
                </Button>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={toggleFavorito}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-3 text-sm font-medium transition-colors ${
                    favorito
                      ? "border-red-500 bg-red-500/10 text-red-500"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${favorito ? "fill-red-500" : ""}`} />
                  {favorito ? "Salvo" : "Salvar"}
                </button>
                <a
                  href={shareLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Share2 className="h-4 w-4" />
                  Compartilhar
                </a>
              </div>

            </div>

            {/* Formulário de captação de lead */}
            <LeadForm
              imovelId={Number(imovel.id)}
              imovelTitulo={imovel.titulo}
              whatsappCorretor={imovel.whatsapp}
            />
          </div>

        </div>
      </div>

      {/* WhatsApp flutuante mobile */}
      {waLink && (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-20 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg lg:hidden"
        >
          <MessageCircle className="h-5 w-5" />
          WhatsApp
        </a>
      )}

    </div>
  )
}

function Stat({ Icon, label, valor }: { Icon: React.ComponentType<{ className?: string }>; label: string; valor: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 text-center">
      <Icon className="mx-auto mb-2 h-5 w-5 text-gold" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{valor}</p>
    </div>
  )
}
