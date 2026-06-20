import Link from "next/link"
import Image from "next/image"
import { Building2, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">

          {/* MARCA */}
          <div className="space-y-4">

            <Link
              href="/"
              className="flex items-center gap-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>

              <span className="text-xl font-bold text-foreground">
                Fabiju <span className="text-primary">Imóveis</span>
              </span>
            </Link>

            <p className="text-sm text-muted-foreground">
              Atendimento personalizado para compra,
              venda e aluguel de imóveis com segurança
              e confiança.
            </p>

          </div>

          {/* LINKS */}
          <div className="space-y-4">

            <h3 className="text-sm font-semibold text-foreground">
              Links Rápidos
            </h3>

            <nav className="flex flex-col gap-2">

              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Início
              </Link>

              <Link
                href="/imoveis"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Ver Imóveis
              </Link>

            </nav>

          </div>

          {/* CORRETORA */}
          <div className="space-y-4">

            <h3 className="text-sm font-semibold text-foreground">
              Corretora Responsável
            </h3>

            <div className="flex items-center gap-3">

              <Image
                src="/corretora.jpg"
                alt="Corretora"
                width={60}
                height={60}
                className="rounded-full object-cover h-[60px] w-[60px]"
                unoptimized
              />

              <div>

                <p className="font-medium">
                 (Fabiju)
                </p>

                <p className="text-sm text-muted-foreground">
                  CRECI: 243454
                </p>

              </div>

            </div>

            <div className="mt-3 flex flex-col gap-3">

              <div className="flex items-center gap-2 text-sm text-muted-foreground">

                <Phone className="h-4 w-4 text-primary" />

                (11) 96500-9537

              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">

                <Mail className="h-4 w-4 text-primary" />

                corretora.fabiju243454@gmail.com

              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">

                <MapPin className="h-4 w-4 text-primary" />

                Itapevi, SP

              </div>

            </div>

          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="mt-8 border-t border-border pt-8 text-center space-y-1">

          <p className="text-sm text-muted-foreground">
            © 2026 Fabiju Imóveis.
            Todos os direitos reservados.
          </p>

          <p className="text-xs text-muted-foreground">
            Desenvolvido por{" "}
            <Link
              href="/desenvolvedor"
              className="text-primary hover:underline"
            >
              Paulo Cézar
            </Link>
          </p>

        </div>

      </div>
    </footer>
  )
}