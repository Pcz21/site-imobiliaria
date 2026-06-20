import Link from "next/link"
import { ArrowRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* HERO */}
      <section
        className="relative flex items-center justify-center overflow-hidden text-center px-4"
        style={{ minHeight: "clamp(500px, 70vh, 90vh)" }}
      >

        {/* FOTO DE FUNDO */}
        <div
          className="absolute inset-0 bg-black"
          style={{
            backgroundImage: "url('/fundo.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/45" />

        {/* CONTEÚDO */}
        <div className="relative z-10 w-full max-w-3xl px-2">

          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Encontre o imóvel ideal{" "}
            <span className="text-primary">com confiança</span>
          </h1>

          <p className="mb-8 text-gray-300 md:text-lg">
            Atendimento direto, transparente e profissional para ajudar você a encontrar o imóvel perfeito.
          </p>

          {/* Button asChild — evita <a><button> inválido que quebra hidratação React 19 */}
          <Button asChild size="lg" className="gap-2 bg-primary text-white hover:bg-primary/90">
            <Link href="/imoveis">
              <Search className="h-5 w-5" />
              Ver Imóveis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

        </div>
      </section>

    </div>
  )
}