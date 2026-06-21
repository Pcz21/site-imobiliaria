import { Star, ExternalLink, MessageSquareQuote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const GOOGLE_PERFIL = "https://share.google/2EydB6MDvy5K1GJYU"
const GOOGLE_AVALIAR = "https://g.page/r/CQrF0-Cp-8EuEAE/review"

const NOTA_MEDIA  = 5.0
const TOTAL_AVALS = 23

// ─── Adicione aqui as avaliações reais copiadas do perfil Google ───────────────
// Acesse: Google Business → "Ler avaliações" → copie nome, nota e texto de cada uma
const AVALIACOES: { nome: string; nota: number; texto: string; data: string }[] = [
  {
    nome:  "Clelia Santos",
    nota:  5,
    texto: "Uma excelente profissional, atenciosa, muito educada e prestativa e ama o que faz.",
    data:  "Dez. 2025",
  },
  {
    nome:  "Wellington Arruda",
    nota:  5,
    texto: "Fabi, muito obrigado pela atenção e dedicação no processo da compra do meu apto. Você foi sensacional! Gratidão.",
    data:  "Dez. 2025",
  },
  {
    nome:  "Luciana Souza",
    nota:  5,
    texto: "Corretora trabalha com honestidade e transparência. Atendimento único, personalizado e impecável! Recebemos o suporte necessário desde o primeiro contato até a finalização do processo. Indico de olhos fechados!",
    data:  "Dez. 2025",
  },
]

function Estrelas({ nota, tamanho = "md" }: { nota: number; tamanho?: "sm" | "md" | "lg" }) {
  const cls = tamanho === "lg" ? "h-6 w-6" : tamanho === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${cls} ${i < nota ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`}
        />
      ))}
    </div>
  )
}

function Avatar({ nome }: { nome: string }) {
  const inicial = nome.charAt(0).toUpperCase()
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
      {inicial}
    </div>
  )
}

const LogoGoogle = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export function AvaliacoesGoogle() {
  return (
    <section className="border-t bg-card py-16">
      <div className="container mx-auto px-4">

        {/* CABEÇALHO */}
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            Quem já negociou com a Fabiju recomenda
          </h2>
          <p className="mt-2 text-muted-foreground">
            Veja o que nossos clientes dizem sobre nosso atendimento.
          </p>

          {/* SELO DE DESTAQUE */}
          <div className="mt-6 inline-flex flex-col items-center gap-3 rounded-2xl border bg-background px-8 py-5 shadow-sm">
            <div className="flex items-center gap-3">
              <LogoGoogle className="h-7 w-7" />
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-extrabold leading-none">
                    {NOTA_MEDIA.toFixed(1)}
                  </span>
                  <Estrelas nota={NOTA_MEDIA} tamanho="lg" />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {TOTAL_AVALS} avaliações de clientes satisfeitos
                </p>
              </div>
            </div>

            {/* Linha de destaque secundária */}
            <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-4 py-1.5 dark:bg-amber-950/30">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                5,0 no Google
              </span>
            </div>
          </div>
        </div>

        {/* CARDS DE AVALIAÇÃO */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AVALIACOES.map((av, i) => (
            <Card key={i} className="rounded-2xl">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-3">
                  <Avatar nome={av.nome} />
                  <div>
                    <p className="font-semibold leading-tight">{av.nome}</p>
                    <p className="text-xs text-muted-foreground">{av.data}</p>
                  </div>
                </div>
                <Estrelas nota={av.nota} tamanho="sm" />
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  "{av.texto}"
                </p>
                <div className="mt-4 flex justify-end">
                  <LogoGoogle className="h-4 w-4 opacity-40" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA — texto convite */}
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Sua opinião é muito importante para nós. Avalie nosso atendimento no Google.
        </p>

        {/* BOTÕES */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full gap-2 sm:w-auto"
          >
            <a href={GOOGLE_PERFIL} target="_blank" rel="noopener noreferrer">
              <MessageSquareQuote className="h-4 w-4" />
              Ver todas as avaliações
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>

          <Button
            asChild
            size="lg"
            className="w-full gap-2 sm:w-auto"
          >
            <a href={GOOGLE_AVALIAR} target="_blank" rel="noopener noreferrer">
              <Star className="h-4 w-4 fill-white" />
              Deixar uma avaliação
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>

      </div>
    </section>
  )
}