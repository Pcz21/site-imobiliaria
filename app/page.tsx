import Link from "next/link"
import Image from "next/image"
import {
  Search, MessageCircle, ShieldCheck, Home, Star, MapPin, UserCheck, BadgeCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AvaliacoesGoogle } from "@/components/avaliacoes-google"
import { WHATSAPP_OFICIAL } from "@/lib/data"

const WHATSAPP = `https://wa.me/${WHATSAPP_OFICIAL}?text=` +
  encodeURIComponent("Olá! Gostaria de saber mais sobre os imóveis disponíveis.")

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* HERO */}
      <section
        className="relative flex items-center justify-center overflow-hidden px-5 py-20 text-center sm:px-4"
        style={{ minHeight: "clamp(580px, 84vh, 900px)" }}
      >
        {/* FOTO DE FUNDO — imóvel de alto padrão, sem logo embutido */}
        <div
          className="absolute inset-0 bg-neutral-900"
          style={{
            backgroundImage: "url('/hero.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* OVERLAY — gradiente elegante para legibilidade sobre foto clara */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/55 to-black/45" />

        {/* CONTEÚDO */}
        <div className="relative z-10 mx-auto w-full max-w-3xl">

          {/* Eyebrow */}
          <div className="fade-in-up mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-7 bg-gold/70" />
            <span className="tracking-luxe text-[10px] font-medium uppercase text-gold sm:text-xs">
              Fabiju Imóveis · Itapevi, SP
            </span>
            <span className="h-px w-7 bg-gold/70" />
          </div>

          <h1 className="fade-in-up delay-100 text-balance text-3xl font-medium leading-[1.15] text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Encontre o imóvel ideal{" "}
            <span className="italic text-gold">com confiança</span>
          </h1>

          <p className="fade-in-up delay-200 mx-auto mt-5 max-w-xl text-pretty text-sm leading-relaxed text-gray-200/90 sm:text-base md:text-lg">
            Atendimento direto, transparente e profissional para conduzir você
            em cada etapa — da escolha à conquista do seu imóvel.
          </p>

          {/* BARRA DE BUSCA — form GET nativo, integra com /imoveis (sem JS) */}
          <form
            method="GET"
            action="/imoveis"
            className="fade-in-up delay-300 mx-auto mt-8 flex w-full max-w-2xl flex-col gap-2 rounded-2xl bg-white/95 p-2 shadow-xl backdrop-blur-sm sm:flex-row sm:items-center sm:rounded-full"
          >
            <div className="flex flex-1 items-center gap-2 px-3">
              <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                name="q"
                placeholder="Cidade ou bairro"
                aria-label="Cidade ou bairro"
                className="h-11 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>

            <div className="hidden w-px self-stretch bg-border sm:block" />

            <select
              name="tipo"
              aria-label="Tipo de negócio"
              defaultValue="todos"
              className="h-11 rounded-full bg-transparent px-3 text-sm text-foreground outline-none sm:w-auto"
            >
              <option value="todos">Comprar ou alugar</option>
              <option value="venda">Comprar</option>
              <option value="aluguel">Alugar</option>
            </select>

            <Button type="submit" size="lg" className="h-11 gap-2 rounded-full px-6">
              <Search className="h-4 w-4" />
              Buscar
            </Button>
          </form>

          {/* CTA secundário discreto */}
          <div className="fade-in-up delay-300 mt-5">
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-200/90 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              <MessageCircle className="h-4 w-4" />
              Falar com a corretora
            </a>
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS — faixa de credibilidade sóbria */}
      <section className="border-b bg-background">
        <div className="container mx-auto grid gap-px overflow-hidden px-4 py-2 sm:grid-cols-3">
          {[
            { Icon: ShieldCheck, titulo: "Negociação transparente", texto: "Acompanhamento honesto do primeiro contato à assinatura." },
            { Icon: Home,        titulo: "Imóveis selecionados",    texto: "Curadoria de casas e apartamentos para compra e locação." },
            { Icon: Star,        titulo: "Nota 5,0 no Google",      texto: "Clientes reais que recomendam o atendimento da Fabiju." },
          ].map(({ Icon, titulo, texto }) => (
            <div key={titulo} className="flex items-start gap-4 px-2 py-8 sm:px-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-gold">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold">{titulo}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{texto}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AVALIAÇÕES GOOGLE */}
      <AvaliacoesGoogle />

      {/* CONHEÇA A FABIJU */}
      <section className="border-t bg-background py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-10 lg:grid-cols-[420px_1fr] lg:gap-16">

            {/* Foto profissional */}
            <div className="relative mx-auto w-full max-w-sm">
              <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <Image
                  src="/corretora.jpg"
                  alt="Fabiju — Corretora de Imóveis"
                  width={560}
                  height={700}
                  unoptimized
                  className="h-auto w-full object-cover"
                />
              </div>
              {/* Selo CRECI */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border bg-background px-5 py-2 text-sm font-semibold shadow-md">
                CRECI <span className="text-gold">243454</span>
              </div>
            </div>

            {/* Texto */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-7 bg-gold/70" />
                <span className="tracking-luxe text-xs font-medium uppercase text-gold">
                  Conheça a Fabiju
                </span>
              </div>

              <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
                Fabiju
              </h2>
              <p className="mt-1 text-muted-foreground">
                Corretora de Imóveis · CRECI 243454
              </p>

              <div className="mt-6 space-y-4 text-pretty leading-relaxed text-muted-foreground">
                <p>
                  Atuando em <strong className="font-medium text-foreground">Itapevi e região</strong>,
                  a Fabiju conduz cada negociação com transparência e proximidade —
                  da primeira visita à assinatura do contrato.
                </p>
                <p>
                  Mais do que intermediar imóveis, ela oferece um
                  <strong className="font-medium text-foreground"> atendimento personalizado</strong>:
                  entende o que cada família procura e acompanha todo o processo
                  com dedicação e segurança.
                </p>
              </div>

              {/* Destaques */}
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { Icon: UserCheck,  texto: "Atendimento personalizado" },
                  { Icon: MapPin,     texto: "Itapevi e região" },
                  { Icon: BadgeCheck, texto: "Transparência total" },
                ].map(({ Icon, texto }) => (
                  <div key={texto} className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-gold">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium">{texto}</span>
                  </div>
                ))}
              </div>

              <div className="mt-9">
                <Button asChild size="lg" className="gap-2 rounded-full px-7">
                  <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-5 w-5" />
                    Falar com a Fabiju
                  </a>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}
