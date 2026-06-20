"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { MapPin, Bed, Bath, Maximize, Images, Video, Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { type Imovel, formatarPreco } from "@/lib/data"

interface PropertyCardProps {
  imovel: Imovel
}

export function PropertyCard({ imovel }: PropertyCardProps) {
  const [favorito, setFavorito] = useState(false)

  useEffect(() => {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem("favoritos") || "[]")
      setFavorito(ids.includes(String(imovel.id)))
    } catch {}
  }, [imovel.id])

  function doToggleFavorito() {
    console.log("[FAVORITO] clique detectado — id:", imovel.id)
    try {
      const ids: string[] = JSON.parse(localStorage.getItem("favoritos") || "[]")
      console.log("[FAVORITO] localStorage OK — ids atuais:", ids)
      const id = String(imovel.id)
      const novos = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]
      localStorage.setItem("favoritos", JSON.stringify(novos))
      console.log("[FAVORITO] salvo — favorito agora:", !ids.includes(id))
      setFavorito(v => !v)
    } catch (err) {
      console.error("[FAVORITO] ERRO no localStorage:", err)
    }
  }

  function handleFavoritoClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    doToggleFavorito()
  }

  function handleFavoritoTouch(e: React.TouchEvent) {
    e.stopPropagation()
    e.preventDefault() // impede o click sintético de disparar em seguida
    doToggleFavorito()
  }

  const mensagem = `Olá, tenho interesse no imóvel: ${imovel.titulo}`
  const digits = (imovel.whatsapp || "").replace(/\D/g, "")
  const phone = digits.length === 10 || digits.length === 11
    ? `55${digits}`
    : digits
  const whatsappLink = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(mensagem)}`
    : null

  const imagemPrincipal =
    imovel.imagens?.[0] ||
    imovel.imagem ||
    "/placeholder-property-1.jpg"

  return (
    <Card className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">

      {/* IMAGEM */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">

        <Image
          src={imagemPrincipal}
          alt={imovel.titulo}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* TIPO */}
        <div className="absolute left-3 top-3 z-20">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase shadow-lg ${
              imovel.tipo === "venda"
                ? "bg-primary text-primary-foreground"
                : "bg-white text-black"
            }`}
          >
            {imovel.tipo === "venda" ? "Venda" : "Aluguel"}
          </span>
        </div>

        {/* FAVORITO */}
        <button
          type="button"
          onClick={handleFavoritoClick}
          onTouchEnd={handleFavoritoTouch}
          className="absolute right-3 bottom-3 z-20 flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition-transform active:scale-90"
          style={{
            background: favorito ? "#ef4444" : "rgba(255,255,255,0.9)",
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
            border: "none",
            cursor: "pointer",
          }}
          aria-label={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Heart
            className="h-4 w-4"
            style={{
              color: favorito ? "white" : "#ef4444",
              fill: favorito ? "white" : "none",
              pointerEvents: "none",
            }}
          />
        </button>

        {/* MÍDIAS */}
        <div className="absolute right-3 top-3 z-20 flex flex-col items-end gap-2">
          {imovel.imagens && imovel.imagens.length > 1 && (
            <div className="inline-flex max-w-fit items-center gap-1 rounded-full bg-black/80 px-2 py-1 text-[10px] font-medium text-white shadow-lg">
              <Images className="h-3 w-3 shrink-0" />
              <span className="whitespace-nowrap">{imovel.imagens.length} fotos</span>
            </div>
          )}
          {imovel.videos && imovel.videos.length > 0 && (
            <div className="inline-flex max-w-fit items-center gap-1 rounded-full bg-red-500 px-2 py-1 text-[10px] font-medium text-white shadow-lg">
              <Video className="h-3 w-3 shrink-0" />
              <span className="whitespace-nowrap">Vídeo</span>
            </div>
          )}
        </div>

      </div>

      {/* CONTEÚDO */}
      <CardContent className="space-y-4 p-5">

        <div>
          <h3 className="line-clamp-1 text-lg font-bold text-foreground">
            {imovel.titulo}
          </h3>
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <span className="line-clamp-1">{imovel.cidade}</span>
          </div>
        </div>

        {/* CARACTERÍSTICAS */}
        {(imovel.quartos || imovel.banheiros || imovel.area) && (
          <div className="flex flex-wrap items-center gap-4 border-y py-3 text-sm text-muted-foreground">
            {(imovel.quartos ?? 0) > 0 && (
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4 shrink-0" />
                <span>{imovel.quartos}</span>
              </div>
            )}
            {(imovel.banheiros ?? 0) > 0 && (
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4 shrink-0" />
                <span>{imovel.banheiros}</span>
              </div>
            )}
            {imovel.area && (
              <div className="flex items-center gap-1">
                <Maximize className="h-4 w-4 shrink-0" />
                <span>{imovel.area}m²</span>
              </div>
            )}
          </div>
        )}

        {/* PREÇO */}
        <p className="text-2xl font-bold text-primary">
          {formatarPreco(imovel.preco, imovel.tipo)}
        </p>

        {/* BOTÕES — Button asChild evita <a><button> (anti-pattern que quebra hidratação React 19) */}
        <div className="flex gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/imoveis/${imovel.id}`}>
              Ver detalhes
            </Link>
          </Button>

          {whatsappLink && (
            <Button asChild className="flex-1 bg-green-600 hover:bg-green-700">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </Button>
          )}
        </div>

      </CardContent>
    </Card>
  )
}
