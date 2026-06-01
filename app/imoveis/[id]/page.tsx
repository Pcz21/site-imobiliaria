"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Maximize,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { apiGetImovelById } from "@/lib/api"
import { formatarPreco } from "@/lib/data"
import type { Imovel } from "@/lib/data"

export default function ImovelDetalhesPage() {
  const params = useParams()

  const [imovel, setImovel]                     = useState<Imovel | null>(null)
  const [imagemSelecionada, setImagemSelecionada] = useState(0)
  const [loading, setLoading]                   = useState(true)

  useEffect(() => {
    async function carregarImovel() {
      if (!params?.id) return
      try {
        setLoading(true)
        const data = await apiGetImovelById(Number(params.id))
        setImovel(data)
      } catch (err) {
        console.error(err)
        setImovel(null)
      } finally {
        setLoading(false)
      }
    }
    carregarImovel()
  }, [params])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg">Carregando imóvel...</p>
      </div>
    )
  }

  if (!imovel) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg">Imóvel não encontrado</p>
      </div>
    )
  }

  const imagens =
    (imovel.imagens?.length ?? 0) > 0
      ? imovel.imagens!
      : imovel.imagem
      ? [imovel.imagem]
      : []

  const videos = imovel.videos || []

  const mensagem     = encodeURIComponent(`Olá! Tenho interesse no imóvel: ${imovel.titulo}`)
  const whatsappLink = imovel.whatsapp
    ? `https://wa.me/${imovel.whatsapp}?text=${mensagem}`
    : null

  function proximaImagem() {
    setImagemSelecionada((prev) =>
      prev < imagens.length - 1 ? prev + 1 : 0
    )
  }

  function imagemAnterior() {
    setImagemSelecionada((prev) =>
      prev > 0 ? prev - 1 : imagens.length - 1
    )
  }

  return (
    <div className="min-h-screen bg-background">

      {/* TOPO */}
      <section className="border-b bg-card py-4">
        <div className="container mx-auto px-4">
          <Link href="/imoveis" className="flex items-center gap-2 text-sm hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">

          {/* ESQUERDA */}
          <div className="space-y-6 lg:col-span-2">

            {/* GALERIA */}
            {imagens.length > 0 && (
              <div className="space-y-4">
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted shadow">
                  <Image
                    src={imagens[imagemSelecionada]}
                    alt={imovel.titulo}
                    fill
                    unoptimized
                    className="object-cover"
                  />

                  {imagens.length > 1 && (
                    <>
                      <button
                        onClick={imagemAnterior}
                        className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={proximaImagem}
                        className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
                    {imagemSelecionada + 1}/{imagens.length}
                  </div>
                </div>

                {imagens.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {imagens.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setImagemSelecionada(index)}
                        className={`relative h-24 min-w-[110px] overflow-hidden rounded-xl border-2 transition ${
                          imagemSelecionada === index ? "border-primary" : "border-transparent"
                        }`}
                      >
                        <Image src={img} alt={`Imagem ${index}`} fill unoptimized className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TÍTULO */}
            <div>
              <h1 className="text-3xl font-bold">{imovel.titulo}</h1>
              <div className="mt-3 flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{imovel.cidade}</span>
              </div>
            </div>

            {/* DETALHES */}
            <Card className="rounded-2xl">
              <CardContent className="space-y-6 p-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {(imovel.quartos ?? 0) > 0 && (
                    <div className="rounded-xl border p-4 text-center">
                      <Bed className="mx-auto mb-2 h-5 w-5 text-primary" />
                      <p className="text-sm text-muted-foreground">Quartos</p>
                      <p className="font-bold">{imovel.quartos}</p>
                    </div>
                  )}
                  {(imovel.banheiros ?? 0) > 0 && (
                    <div className="rounded-xl border p-4 text-center">
                      <Bath className="mx-auto mb-2 h-5 w-5 text-primary" />
                      <p className="text-sm text-muted-foreground">Banheiros</p>
                      <p className="font-bold">{imovel.banheiros}</p>
                    </div>
                  )}
                  {imovel.area && (
                    <div className="rounded-xl border p-4 text-center">
                      <Maximize className="mx-auto mb-2 h-5 w-5 text-primary" />
                      <p className="text-sm text-muted-foreground">Área</p>
                      <p className="font-bold">{imovel.area}m²</p>
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="mb-3 text-xl font-bold">Descrição</h2>
                  <p className="leading-7 text-muted-foreground">{imovel.descricao}</p>
                </div>
              </CardContent>
            </Card>

            {/* VÍDEOS */}
            {videos.length > 0 && (
              <Card className="rounded-2xl">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-2">
                    <PlayCircle className="h-5 w-5 text-red-500" />
                    <h2 className="text-xl font-bold">Vídeos</h2>
                  </div>
                  <div className="grid gap-4">
                    {videos.map((video, index) => (
                      <video key={index} controls className="w-full rounded-xl">
                        <source src={video} />
                      </video>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>

          {/* DIREITA — sticky */}
          <div>
            <Card className="sticky top-20 rounded-2xl border shadow-sm">
              <CardContent className="space-y-6 p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Valor do imóvel</p>
                  <h2 className="mt-1 text-3xl font-bold text-primary">
                    {formatarPreco(imovel.preco, imovel.tipo)}
                  </h2>
                </div>

                {whatsappLink && (
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <Button className="h-12 w-full bg-green-600 text-base hover:bg-green-700">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Falar no WhatsApp
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

    </div>
  )
}
