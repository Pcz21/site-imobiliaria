"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, MapPin, Bed, Bath, Maximize, MessageCircle, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getImovelById, formatarPreco } from "@/lib/data"

export default function ImovelDetalhesPage() {
  const params = useParams()
  const [imovel, setImovel] = useState<any>(null)

  useEffect(() => {
    if (!params?.id) return

    const data = getImovelById(params.id as string)
    setImovel(data)
  }, [params])

  if (!imovel) {
    return <p className="p-10 text-center">Carregando imóvel...</p>
  }

  const whatsappMessage = encodeURIComponent(
    `Olá! Tenho interesse no imóvel: ${imovel.titulo} - ${imovel.cidade}. Preço: ${formatarPreco(imovel.preco, imovel.tipo)}`
  )

  const whatsappLink = `https://wa.me/5511999999999?text=${whatsappMessage}`

  return (
    <div className="min-h-screen">
      
      {/* Voltar */}
      <section className="border-b bg-card py-4">
        <div className="container mx-auto px-4">
          <Link href="/imoveis" className="flex items-center gap-2 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">

          {/* ESQUERDA */}
          <div className="lg:col-span-2 space-y-6">

            <div className="relative aspect-video rounded-xl overflow-hidden">
              <Image
                src={imovel.imagem || "/placeholder-property-1.jpg"}
                alt={imovel.titulo}
                fill
                className="object-cover"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold">{imovel.titulo}</h1>
              <p className="flex items-center gap-2 text-gray-500">
                <MapPin className="h-4 w-4" />
                {imovel.cidade}
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <p>{imovel.descricao}</p>
              </CardContent>
            </Card>

            {/* Características */}
            <div className="grid grid-cols-3 gap-4">
              {imovel.quartos && (
                <div className="text-center">
                  <Bed />
                  <p>{imovel.quartos} quartos</p>
                </div>
              )}
              {imovel.banheiros && (
                <div className="text-center">
                  <Bath />
                  <p>{imovel.banheiros} banheiros</p>
                </div>
              )}
              {imovel.area && (
                <div className="text-center">
                  <Maximize />
                  <p>{imovel.area}m²</p>
                </div>
              )}
            </div>

          </div>

          {/* DIREITA */}
          <div>
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-primary">
                {formatarPreco(imovel.preco, imovel.tipo)}
              </h2>

              <div className="mt-4 space-y-3">
                <a href={whatsappLink} target="_blank">
                  <Button className="w-full bg-green-500 text-white">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Button>
                </a>

                <a href="tel:+5511999999999">
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4" />
                    Ligar
                  </Button>
                </a>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}