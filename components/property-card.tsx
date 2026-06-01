import Link from "next/link"
import Image from "next/image"

import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Images,
  Video,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import {
  type Imovel,
  formatarPreco,
} from "@/lib/data"

interface PropertyCardProps {
  imovel: Imovel
}

export function PropertyCard({
  imovel,
}: PropertyCardProps) {

  const mensagem =
    `Olá, tenho interesse no imóvel: ${imovel.titulo}`

  const whatsappLink = imovel.whatsapp
    ? `https://wa.me/${imovel.whatsapp}?text=${encodeURIComponent(mensagem)}`
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

            {imovel.tipo === "venda"
              ? "Venda"
              : "Aluguel"}

          </span>

        </div>

        {/* MIDIAS */}
        <div className="absolute right-3 top-3 z-20 flex flex-col items-end gap-2">

          {/* FOTOS */}
          {imovel.imagens &&
            imovel.imagens.length > 1 && (

            <div className="inline-flex max-w-fit items-center gap-1 rounded-full bg-black/80 px-2 py-1 text-[10px] font-medium text-white shadow-lg">

              <Images className="h-3 w-3 shrink-0" />

              <span className="whitespace-nowrap">

                {imovel.imagens.length} fotos

              </span>

            </div>

          )}

          {/* VIDEO */}
          {imovel.videos &&
            imovel.videos.length > 0 && (

            <div className="inline-flex max-w-fit items-center gap-1 rounded-full bg-red-500 px-2 py-1 text-[10px] font-medium text-white shadow-lg">

              <Video className="h-3 w-3 shrink-0" />

              <span className="whitespace-nowrap">

                Vídeo

              </span>

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

            <span className="line-clamp-1">

              {imovel.cidade}

            </span>

          </div>

        </div>

        {/* INFO */}
        {(imovel.quartos ||
          imovel.banheiros ||
          imovel.area) && (

          <div className="flex flex-wrap items-center gap-4 border-y py-3 text-sm text-muted-foreground">

            {(imovel.quartos ?? 0) > 0 && (

              <div className="flex items-center gap-1">

                <Bed className="h-4 w-4 shrink-0" />

                <span>
                  {imovel.quartos}
                </span>

              </div>

            )}

            {(imovel.banheiros ?? 0) > 0 && (

              <div className="flex items-center gap-1">

                <Bath className="h-4 w-4 shrink-0" />

                <span>
                  {imovel.banheiros}
                </span>

              </div>

            )}

            {imovel.area && (

              <div className="flex items-center gap-1">

                <Maximize className="h-4 w-4 shrink-0" />

                <span>
                  {imovel.area}m²
                </span>

              </div>

            )}

          </div>

        )}

        {/* PREÇO */}
        <div>

          <p className="text-2xl font-bold text-primary">

            {formatarPreco(
              imovel.preco,
              imovel.tipo
            )}

          </p>

        </div>

        {/* BOTÕES */}
        <div className="flex gap-2">

          <Link
            href={`/imoveis/${imovel.id}`}
            className="flex-1"
          >

            <Button
              variant="outline"
              className="w-full"
            >

              Ver detalhes

            </Button>

          </Link>

          {whatsappLink && (

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >

              <Button className="w-full bg-green-600 hover:bg-green-700">

                WhatsApp

              </Button>

            </a>

          )}

        </div>

      </CardContent>

    </Card>

  )

}