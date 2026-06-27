"use client"

import { useState } from "react"
import { MessageCircle, CheckCircle2, Loader2, Send } from "lucide-react"
import { apiCriarLead, type TipoInteresse } from "@/lib/api"
import { WHATSAPP_OFICIAL } from "@/lib/data"

interface Props {
  imovelId: number
  imovelTitulo: string
  /** WhatsApp do imóvel/corretor (qualquer formato) — usado para abrir a conversa após salvar. */
  whatsappCorretor?: string
}

const OPCOES: { valor: TipoInteresse; rotulo: string }[] = [
  { valor: "visitar",       rotulo: "Quero visitar" },
  { valor: "informacoes",   rotulo: "Quero mais informações" },
  { valor: "negociar",      rotulo: "Quero negociar" },
  { valor: "financiamento", rotulo: "Quero simular financiamento" },
]

// Máscara progressiva de telefone BR: (11) 99999-9999
function mascararWhatsapp(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 2)  return d.length ? `(${d}` : ""
  if (d.length <= 6)  return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function resolverTelefone(whatsapp?: string): string {
  const d = (whatsapp || "").replace(/\D/g, "")
  if (d.length === 10 || d.length === 11) return `55${d}`
  if (d.length >= 12) return d
  return WHATSAPP_OFICIAL
}

export function LeadForm({ imovelId, imovelTitulo, whatsappCorretor }: Props) {
  const [nome, setNome]           = useState("")
  const [whatsapp, setWhatsapp]   = useState("")
  const [mensagem, setMensagem]   = useState("")
  const [tipo, setTipo]           = useState<TipoInteresse>("visitar")
  const [enviando, setEnviando]   = useState(false)
  const [erro, setErro]           = useState("")
  const [sucesso, setSucesso]     = useState(false)

  const rotuloTipo = OPCOES.find((o) => o.valor === tipo)?.rotulo ?? ""

  const waLink = (() => {
    const phone = resolverTelefone(whatsappCorretor)
    const texto = `Olá! Sou ${nome || "um interessado"} e tenho interesse no imóvel: ${imovelTitulo}. ${rotuloTipo}.`
    return `https://wa.me/${phone}?text=${encodeURIComponent(texto)}`
  })()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro("")

    const nomeLimpo = nome.trim()
    const digitos = whatsapp.replace(/\D/g, "")

    if (nomeLimpo.length < 2) {
      setErro("Informe seu nome completo.")
      return
    }
    if (digitos.length < 10 || digitos.length > 11) {
      setErro("Informe um WhatsApp válido com DDD.")
      return
    }

    setEnviando(true)
    try {
      await apiCriarLead({
        nome: nomeLimpo,
        whatsapp: digitos,
        mensagem: mensagem.trim() || undefined,
        tipoInteresse: tipo,
        imovelId,
        origem: "detalhe_imovel",
      })
      setSucesso(true)
      // Abre o WhatsApp somente após salvar com sucesso (pode ser bloqueado por popup;
      // o botão na tela de sucesso é o caminho garantido).
      try { window.open(waLink, "_blank", "noopener,noreferrer") } catch {}
    } catch (err: any) {
      setErro(err?.message || "Não foi possível enviar. Tente novamente.")
    } finally {
      setEnviando(false)
    }
  }

  if (sucesso) {
    return (
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
          <h3 className="text-lg font-semibold text-foreground">Interesse enviado!</h3>
          <p className="text-sm text-muted-foreground">
            Recebemos seu contato e retornaremos em breve. Se preferir, fale agora pelo WhatsApp.
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700"
          >
            <MessageCircle className="h-5 w-5" />
            Falar no WhatsApp agora
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground">Tenho interesse neste imóvel</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Deixe seu contato que retornamos rapidinho.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Nome completo</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome"
            autoComplete="name"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-gold"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">WhatsApp</label>
          <input
            type="tel"
            inputMode="numeric"
            value={whatsapp}
            onChange={(e) => setWhatsapp(mascararWhatsapp(e.target.value))}
            placeholder="(11) 99999-9999"
            autoComplete="tel"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-gold"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Tipo de interesse</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoInteresse)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-gold"
          >
            {OPCOES.map((o) => (
              <option key={o.valor} value={o.valor}>{o.rotulo}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Mensagem <span className="text-muted-foreground/60">(opcional)</span>
          </label>
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Conte o que você procura…"
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-gold"
          />
        </div>

        {erro && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">{erro}</p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 disabled:opacity-60"
        >
          {enviando ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Enviando…</>
          ) : (
            <><Send className="h-4 w-4" /> Enviar interesse</>
          )}
        </button>

        <p className="text-center text-[11px] leading-relaxed text-muted-foreground/80">
          Usaremos seus dados apenas para retornar seu contato sobre este imóvel.
        </p>
      </form>
    </div>
  )
}
