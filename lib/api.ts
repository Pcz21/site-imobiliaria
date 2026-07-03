import { Imovel } from "@/lib/data"

// URL base para chamadas SERVER-SIDE (Next.js → .NET diretamente)
const API_URL = process.env.API_URL ?? "http://localhost:5162"

// Resolve o endpoint correto dependendo do contexto de execução:
//   - Servidor (SSR/RSC): usa URL completa → Next.js chama .NET diretamente
//   - Cliente (browser):  usa URL relativa → browser chama Next.js proxy
//     que por sua vez chama o .NET — funciona em qualquer dispositivo
//     porque o celular não precisa alcançar "localhost:5162"
function buildUrl(path: string, qs?: Record<string, string>): string {
  const base = typeof window === "undefined" ? API_URL : ""
  const query = qs && Object.keys(qs).length > 0
    ? "?" + new URLSearchParams(qs).toString()
    : ""
  return `${base}${path}${query}`
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  // Cookie é a fonte primária (server action login)
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/)
  if (match) return match[1]
  // Fallback legado para sessões antigas via localStorage
  return localStorage.getItem("token")
}

function authHeaders(auth = false): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" }
  if (auth) {
    const token = getToken()
    if (token) h["Authorization"] = `Bearer ${token}`
  }
  return h
}

// ─── Mapper: API (camelCase) → Imovel ─────────────────────────────────────────

function mapImovel(d: any): Imovel {
  return {
    id:             d.id,
    titulo:         d.titulo,
    cidade:         d.cidade,
    preco:          Number(d.preco),
    descricao:      d.descricao ?? "",
    tipo:           (d.tipo as string)?.toLowerCase() as "venda" | "aluguel",
    imagem:         d.imagem ?? d.capa ?? undefined,
    capa:           d.capa ?? undefined,
    imagens:        d.imagens ?? [],
    videos:         d.videos ?? [],
    quartos:        d.quartos,
    banheiros:      d.banheiros,
    area:           d.area ?? undefined,
    vagas:          d.vagas,
    destaque:       d.destaque,
    ativo:          d.ativo,
    visualizacoes:  d.visualizacoes,
    corretor_email: d.corretorEmail ?? undefined,
    whatsapp:       d.whatsapp ?? undefined,
    endereco:       d.endereco ?? undefined,
    leads:          d.leads ?? 0,
    created_at:     d.criadoEm,
    updated_at:     d.atualizadoEm,
  }
}

// ─── Imóveis ──────────────────────────────────────────────────────────────────

export async function apiGetImoveis(params?: {
  tipo?: string
  busca?: string
  quartos?: number
  precoMax?: number
  corretorEmail?: string
  ordenacao?: string
}): Promise<Imovel[]> {
  const qs: Record<string, string> = {}
  if (params?.tipo && params.tipo !== "todos") qs.tipo = params.tipo
  if (params?.busca)         qs.busca = params.busca
  if (params?.quartos)       qs.quartos = String(params.quartos)
  if (params?.precoMax)      qs.precoMax = String(params.precoMax)
  if (params?.corretorEmail) {
    // Garante que o email esteja decodificado antes de passar ao URLSearchParams.
    // Se chegar como "spaulo456.com%40gmail.com", URLSearchParams produziria "%2540".
    // Com decode primeiro: "%40" → "@" → URLSearchParams → "%40" → .NET decodifica → "@" ✓
    const email = params.corretorEmail
    qs.corretorEmail = (() => { try { return decodeURIComponent(email) } catch { return email } })()
  }
  if (params?.ordenacao)     qs.ordenacao = params.ordenacao

  const url = buildUrl("/api/imoveis", qs)
  const controller = new AbortController()
  const timeoutId  = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error("Erro ao carregar imóveis")
    const data = await res.json()
    return (data as any[]).map(mapImovel)
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function apiGetImovelById(id: number): Promise<Imovel | null> {
  const url = buildUrl(`/api/imoveis/${id}`)
  const controller = new AbortController()
  const timeoutId  = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (res.status === 404) return null
    if (!res.ok) throw new Error("Erro ao carregar imóvel")
    return mapImovel(await res.json())
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function apiCriarImovel(dados: {
  titulo:    string
  cidade:    string
  preco:     number
  descricao: string
  tipo:      string
  imagens:   string[]
  videos:    string[]
  quartos:   number
  banheiros: number
  area:      number | null
  vagas:     number
  destaque:  boolean
  whatsapp:  string
  endereco?: string
}): Promise<Imovel> {
  // Rota proxy do Next (mesma origem) injeta o JWT do cookie HttpOnly como Bearer
  const res = await fetch(`/api/imoveis`, {
    method:  "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      titulo:    dados.titulo,
      cidade:    dados.cidade,
      preco:     dados.preco,
      descricao: dados.descricao,
      tipo:      dados.tipo,
      imagem:    dados.imagens[0] ?? null,
      imagens:   dados.imagens,
      videos:    dados.videos,
      quartos:   dados.quartos,
      banheiros: dados.banheiros,
      area:      dados.area,
      vagas:     dados.vagas,
      destaque:  dados.destaque,
      whatsapp:  dados.whatsapp || null,
      endereco:  dados.endereco || null,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || "Erro ao criar imóvel")
  }
  return mapImovel(await res.json())
}

export async function apiRegistrarLead(id: number): Promise<void> {
  try {
    await fetch(`${API_URL}/api/imoveis/${id}/leads`, { method: "POST" })
  } catch {
    // fire-and-forget
  }
}

// Registra 1 visualização (chamado apenas pela página pública do imóvel,
// no browser, após checagens de sessão/dedupe). Fire-and-forget.
export async function apiRegistrarVisualizacao(id: number): Promise<void> {
  try {
    await fetch(`/api/imoveis/${id}/visualizacoes`, { method: "POST" })
  } catch {
    // fire-and-forget
  }
}

export async function apiAtualizarImovel(
  id: number,
  dados: {
    titulo?:    string
    cidade?:    string
    preco?:     number
    descricao?: string
    tipo?:      string
    imagens?:   string[]
    videos?:    string[]
    quartos?:   number
    banheiros?: number
    area?:      number | null
    vagas?:     number
    destaque?:  boolean
    whatsapp?:  string
    endereco?:  string
  }
): Promise<Imovel> {
  const body: any = { ...dados }
  if (dados.imagens !== undefined) {
    body.imagem = dados.imagens[0] ?? null
  }

  const res = await fetch(`/api/imoveis/${id}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || "Erro ao atualizar imóvel")
  }
  return mapImovel(await res.json())
}

export async function apiDeletarImovel(id: number): Promise<void> {
  const res = await fetch(`/api/imoveis/${id}`, {
    method:  "DELETE",
  })
  if (!res.ok && res.status !== 204) {
    throw new Error("Erro ao remover imóvel")
  }
}

// ─── Leads ──────────────────────────────────────────────────────────────────────

export type TipoInteresse = "visitar" | "informacoes" | "negociar" | "financiamento"
export type LeadStatus    = "novo" | "atendido" | "visita_marcada" | "fechado" | "arquivado"

export interface Lead {
  id: number
  nome: string
  whatsapp: string
  mensagem?: string | null
  tipoInteresse: string
  origem: string
  status: LeadStatus
  imovelId?: number | null
  imovelTitulo?: string | null
  imovelCidade?: string | null
  criadoEm: string
  atualizadoEm?: string | null
}

export interface LeadsPagina {
  itens: Lead[]
  total: number
  pagina: number
  tamanhoPagina: number
  totalNovos: number
  totalAtendidos: number
}

// POST público — registra interesse em um imóvel.
// Lança Error com a mensagem amigável do servidor em caso de falha (inclui anti-spam 429).
export async function apiCriarLead(dados: {
  nome: string
  whatsapp: string
  mensagem?: string
  tipoInteresse: TipoInteresse
  imovelId?: number
  origem?: string
}): Promise<{ id: number; mensagem: string }> {
  const res = await fetch(`/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome:          dados.nome,
      whatsapp:      dados.whatsapp,
      mensagem:      dados.mensagem || null,
      tipoInteresse: dados.tipoInteresse,
      imovelId:      dados.imovelId ?? null,
      origem:        dados.origem || "detalhe_imovel",
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.mensagem || "Não foi possível enviar seu contato. Tente novamente.")
  }
  return { id: data.id, mensagem: data.mensagem ?? "Interesse registrado com sucesso!" }
}

// GET protegido — lista leads (proxy injeta o JWT do cookie HttpOnly).
export async function apiGetLeads(params?: {
  pagina?: number
  tamanho?: number
  status?: LeadStatus
  imovelId?: number
}): Promise<LeadsPagina> {
  const qs: Record<string, string> = {}
  if (params?.pagina)   qs.pagina   = String(params.pagina)
  if (params?.tamanho)  qs.tamanho  = String(params.tamanho)
  if (params?.status)   qs.status   = params.status
  if (params?.imovelId) qs.imovelId = String(params.imovelId)
  const query = Object.keys(qs).length ? "?" + new URLSearchParams(qs).toString() : ""

  const res = await fetch(`/api/leads${query}`, { credentials: "same-origin" })
  if (!res.ok) throw new Error("Erro ao carregar leads")
  return res.json()
}

// PATCH protegido — atualiza o status de um lead.
export async function apiAtualizarStatusLead(id: number, status: LeadStatus): Promise<Lead> {
  const res = await fetch(`/api/leads/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || "Erro ao atualizar status do lead")
  }
  return res.json()
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export async function apiUploadArquivo(file: File): Promise<string | null> {
  const formData = new FormData()
  formData.append("file", file)

  try {
    // Rota proxy do Next injeta o JWT do cookie HttpOnly como Bearer
    const res = await fetch(`/api/uploads/imoveis`, {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ erro: res.statusText }))
      console.error(`[upload] Falha em "${file.name}":`, err.erro)
      return null
    }

    const data = await res.json()
    return data.url as string
  } catch (e) {
    console.error(`[upload] Erro de rede ao enviar "${file.name}":`, e)
    return null
  }
}

// Envia vários arquivos em paralelo (pool limitado) preservando a ordem.
// 3 simultâneos: acelera lotes grandes (ex.: 20 fotos) sem saturar a conexão.
export async function apiUploadArquivos(
  files: File[],
  concorrencia = 3
): Promise<(string | null)[]> {
  const resultados: (string | null)[] = new Array(files.length).fill(null)
  let proximo = 0

  async function worker() {
    while (proximo < files.length) {
      const i = proximo++
      resultados[i] = await apiUploadArquivo(files[i])
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concorrencia, files.length) }, worker)
  )
  return resultados
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function apiLogin(
  email: string,
  senha: string
): Promise<{ token: string; email: string }> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email, senha }),
  })
  if (!res.ok) throw new Error("Email ou senha incorretos")
  return res.json()
}
