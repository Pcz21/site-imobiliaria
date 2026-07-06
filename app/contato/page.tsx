import type { Metadata } from "next"
import { MessageCircle, Mail, MapPin } from "lucide-react"
import { HubspotForm } from "@/components/hubspot-form"

export const metadata: Metadata = {
  title: "Contato | Fabiju Imóveis",
  description:
    "Fale com a Fabiju Imóveis — compra, venda e aluguel de imóveis em Barueri, Osasco e região.",
}

export default function ContatoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-14">
        <div className="mb-10 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-7 bg-gold/70" />
            <span className="tracking-luxe text-[10px] font-medium uppercase text-gold sm:text-xs">
              Fale conosco
            </span>
            <span className="h-px w-7 bg-gold/70" />
          </div>
          <h1 className="text-3xl font-medium tracking-tight">
            Entre em <span className="text-gold">contato</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Deixe seus dados que a Fabiju retorna o quanto antes.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 sm:p-8">
          <HubspotForm />
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 text-sm text-muted-foreground sm:flex-row sm:justify-center sm:gap-8">
          <span className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            (11) 96500-9537
          </span>
          <span className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            corretora.fabiju243454@gmail.com
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Barueri, Osasco e região — SP
          </span>
        </div>
      </div>
    </div>
  )
}
