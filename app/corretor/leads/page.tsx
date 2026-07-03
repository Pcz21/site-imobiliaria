"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  MessageCircle,
  Check,
  CalendarCheck,
  Archive,
  Inbox,
  CheckCircle2,
  Users,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  apiGetLeads,
  apiAtualizarStatusLead,
  type Lead,
  type LeadStatus,
} from "@/lib/api"

const TIPO_LABEL: Record<string, string> = {
  visitar:       "Visitar",
  informacoes:   "Informações",
  negociar:      "Negociar",
  financiamento: "Financiamento",
}

const ORIGEM_LABEL: Record<string, string> = {
  detalhe_imovel: "Detalhe do imóvel",
  listagem:       "Listagem",
  home:           "Home",
  alerta:         "Alerta",
}

const STATUS_META: Record<LeadStatus, { label: string; classe: string }> = {
  novo:           { label: "Novo",           classe: "bg-blue-500/10 text-blue-600" },
  atendido:       { label: "Atendido",       classe: "bg-green-500/10 text-green-600" },
  visita_marcada: { label: "Visita marcada", classe: "bg-amber-500/10 text-amber-600" },
  fechado:        { label: "Fechado",        classe: "bg-foreground/10 text-foreground" },
  arquivado:      { label: "Arquivado",      classe: "bg-muted text-muted-foreground" },
}

const TAMANHO_PAGINA = 20

function formatarData(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  const p = (n: number) => String(n).padStart(2, "0")
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`
}

function linkWhatsapp(lead: Lead): string {
  const d = (lead.whatsapp || "").replace(/\D/g, "")
  const phone = d.length === 10 || d.length === 11 ? `55${d}` : d
  // Remove U+FFFD (caracteres corrompidos em dados antigos) e espaços duplicados
  const nome = (lead.nome || "").replace(/�/g, "").replace(/\s+/g, " ").trim()
  const titulo = (lead.imovelTitulo || "").replace(/�/g, "").replace(/\s+/g, " ").trim()
  const imovel = titulo ? ` sobre o imóvel "${titulo}"` : ""
  const texto = `Olá, ${nome}! Aqui é da Fabiju Imóveis. Recebemos seu interesse${imovel}. Como podemos te ajudar?`
  return `https://wa.me/${phone}?text=${encodeURIComponent(texto)}`
}

export default function LeadsPage() {
  const [pagina, setPagina]   = useState(1)
  const [dados, setDados]     = useState<{ itens: Lead[]; total: number; novos: number; atendidos: number }>(
    { itens: [], total: 0, novos: 0, atendidos: 0 }
  )
  const [loading, setLoading]       = useState(true)
  const [atualizandoId, setAtualizandoId] = useState<number | null>(null)
  const [erro, setErro]             = useState("")

  const carregar = useCallback(async (pg: number) => {
    setLoading(true)
    setErro("")
    try {
      const r = await apiGetLeads({ pagina: pg, tamanho: TAMANHO_PAGINA })
      setDados({ itens: r.itens, total: r.total, novos: r.totalNovos, atendidos: r.totalAtendidos })
    } catch (e: any) {
      setErro("Não foi possível carregar os leads.")
      setDados({ itens: [], total: 0, novos: 0, atendidos: 0 })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Autenticacao real e garantida pelo proxy.ts (server-side) + proxy de API (JWT HttpOnly).
    // O token e HttpOnly, entao document.cookie nao consegue le-lo no client.
    carregar(pagina)
  }, [pagina, carregar])

  async function mudarStatus(lead: Lead, status: LeadStatus) {
    setAtualizandoId(lead.id)
    try {
      await apiAtualizarStatusLead(lead.id, status)
      // Reflete a mudança na linha imediatamente…
      setDados((prev) => ({
        ...prev,
        itens: prev.itens.map((l) => (l.id === lead.id ? { ...l, status } : l)),
      }))
      // …e recarrega para sincronizar os contadores globais (novos/atendidos).
      carregar(pagina)
    } catch {
      setErro("Não foi possível atualizar o status.")
    } finally {
      setAtualizandoId(null)
    }
  }

  const totalPaginas = Math.max(1, Math.ceil(dados.total / TAMANHO_PAGINA))

  return (
    <div className="min-h-screen bg-background">

      {/* HEADER */}
      <section className="border-b bg-card">
        <div className="container mx-auto flex flex-col gap-6 px-4 py-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2.5">
              <span className="h-px w-6 bg-gold/70" />
              <span className="tracking-luxe text-[11px] font-medium uppercase text-gold">
                Área administrativa
              </span>
            </div>
            <h1 className="text-3xl font-medium tracking-tight">
              Gestão de <span className="text-gold">Leads</span>
            </h1>
            <p className="mt-2 text-muted-foreground">Acompanhe e atenda os interessados nos seus imóveis</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/corretor/painel">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao painel
              </Link>
            </Button>
            <Button onClick={() => carregar(pagina)} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>
      </section>

      {/* CONTEÚDO */}
      <div className="container mx-auto px-4 py-10">

        {/* KPIs */}
        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="rounded-xl">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-blue-500/10 p-4">
                <Inbox className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Leads novos</p>
                <p className="text-3xl font-bold">{dados.novos}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-green-500/10 p-4">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Leads atendidos</p>
                <p className="text-3xl font-bold">{dados.atendidos}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-gold/10 p-4">
                <Users className="h-6 w-6 text-gold" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de leads</p>
                <p className="text-3xl font-bold">{dados.total}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* LISTA */}
        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold">Leads recentes</h2>
            {dados.total > 0 && (
              <span className="text-sm text-muted-foreground">
                Página {pagina} de {totalPaginas}
              </span>
            )}
          </div>

          {erro && (
            <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600">{erro}</p>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : dados.itens.length === 0 ? (
            <Card className="rounded-2xl border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <Inbox className="mb-5 h-14 w-14 text-muted-foreground" />
                <h3 className="text-2xl font-bold">Nenhum lead ainda</h3>
                <p className="mt-2 max-w-md text-muted-foreground">
                  Os interessados que enviarem o formulário nos imóveis aparecerão aqui.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="divide-y overflow-hidden rounded-xl border bg-card">
              {dados.itens.map((lead) => {
                const meta = STATUS_META[lead.status] ?? STATUS_META.novo
                const ocupado = atualizandoId === lead.id
                return (
                  <div
                    key={lead.id}
                    className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground">{lead.nome}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.classe}`}>
                          {meta.label}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span>{lead.whatsapp}</span>
                        <span className="text-muted-foreground/50">•</span>
                        <span>{TIPO_LABEL[lead.tipoInteresse] ?? lead.tipoInteresse}</span>
                        <span className="text-muted-foreground/50">•</span>
                        <span>{ORIGEM_LABEL[lead.origem] ?? lead.origem}</span>
                        <span className="text-muted-foreground/50">•</span>
                        <span>{formatarData(lead.criadoEm)}</span>
                      </div>
                      {lead.imovelTitulo && (
                        <p className="mt-1 truncate text-sm text-muted-foreground/90">
                          Imóvel: <span className="text-foreground/80">{lead.imovelTitulo}</span>
                          {lead.imovelCidade ? ` — ${lead.imovelCidade}` : ""}
                        </p>
                      )}
                      {lead.mensagem && (
                        <p className="mt-1 line-clamp-2 text-sm italic text-muted-foreground/80">
                          “{lead.mensagem}”
                        </p>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <a
                        href={linkWhatsapp(lead)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Abrir WhatsApp"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-700"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </a>

                      <AcaoBtn
                        title="Marcar como atendido"
                        disabled={ocupado || lead.status === "atendido"}
                        onClick={() => mudarStatus(lead, "atendido")}
                        Icon={Check}
                      />
                      <AcaoBtn
                        title="Marcar visita marcada"
                        disabled={ocupado || lead.status === "visita_marcada"}
                        onClick={() => mudarStatus(lead, "visita_marcada")}
                        Icon={CalendarCheck}
                      />
                      <AcaoBtn
                        title="Arquivar"
                        disabled={ocupado || lead.status === "arquivado"}
                        onClick={() => mudarStatus(lead, "arquivado")}
                        Icon={Archive}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Paginação */}
          {!loading && totalPaginas > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={pagina <= 1}
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">{pagina} / {totalPaginas}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagina >= totalPaginas}
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              >
                Próxima
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function AcaoBtn({
  title, onClick, disabled, Icon,
}: {
  title: string
  onClick: () => void
  disabled?: boolean
  Icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
