import Link from "next/link"
import { Building2, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                PCZ <span className="text-primary">Imóveis</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Conectando você ao imóvel dos seus sonhos. Plataforma confiável para corretores e clientes.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Links Rápidos</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Início
              </Link>
              <Link href="/imoveis" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Ver Imóveis
              </Link>
              <Link href="/corretor/login" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Área do Corretor
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Contato</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                contato@pczimoveis.com.br
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                (11) 99999-9999
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                São Paulo, SP
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PCZ Imóveis. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
