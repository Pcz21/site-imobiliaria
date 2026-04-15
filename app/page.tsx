import Link from "next/link"
import { ArrowRight, Building2, Users, Shield, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PropertyCard } from "@/components/property-card"
import { getImoveisDestaque } from "@/lib/data"

export default function HomePage() {
  const imoveisDestaque = getImoveisDestaque()

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <div className="container relative z-10 mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Encontre o imóvel ideal{" "}
              <span className="text-primary">com confiança</span>
            </h1>
            <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl">
              Conectamos você aos melhores imóveis do mercado. Seja para comprar, vender ou alugar, estamos aqui para ajudar você a encontrar o lar perfeito.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/imoveis">
                <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Search className="h-5 w-5" />
                  Ver Imóveis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/corretor/login">
                <Button size="lg" variant="outline" className="gap-2 border-border text-foreground hover:bg-card">
                  Sou Corretor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-card py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Variedade de Imóveis</h3>
              <p className="text-sm text-muted-foreground">
                Apartamentos, casas, salas comerciais e muito mais para você escolher.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Corretores Qualificados</h3>
              <p className="text-sm text-muted-foreground">
                Profissionais experientes prontos para ajudar você em cada etapa.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Negociação Segura</h3>
              <p className="text-sm text-muted-foreground">
                Transparência e segurança em todas as transações imobiliárias.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex flex-col items-center justify-between gap-4 md:flex-row">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Imóveis em Destaque</h2>
              <p className="mt-2 text-muted-foreground">
                Confira os imóveis mais procurados da nossa plataforma
              </p>
            </div>
            <Link href="/imoveis">
              <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Ver Todos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {imoveisDestaque.map((imovel) => (
              <PropertyCard key={imovel.id} imovel={imovel} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-card py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            Quer anunciar seu imóvel?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            Seja um corretor parceiro e alcance milhares de potenciais clientes. 
            Publique seus imóveis e receba contatos diretamente no seu WhatsApp.
          </p>
          <Link href="/corretor/login">
            <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              Começar Agora
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
