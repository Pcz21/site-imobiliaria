import { Imovel } from "@/lib/data"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5162"

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null
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
    tipo:           d.tipo as "venda" | "aluguel",
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
  const url = new URL(`${API_URL}/api/imoveis`)
  if (params?.tipo && params.tipo !== "todos") url.searchParams.set("tipo", params.tipo)
  if (params?.busca)         url.searchParams.set("busca", params.busca)
  if (params?.quartos)       url.searchParams.set("quartos", String(params.quartos))
  if (params?.precoMax)      url.searchParams.set("precoMax", String(params.precoMax))
  if (params?.corretorEmail) url.searchParams.set("corretorEmail", params.corretorEmail)
  if (params?.ordenacao)     url.searchParams.set("ordenacao", params.ordenacao)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error("Erro ao carregar imóveis")
  const data = await res.json()
  return (data as any[]).map(mapImovel)
}

export async function apiGetImovelById(id: number): Promise<Imovel | null> {
  const res = await fetch(`${API_URL}/api/imoveis/${id}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error("Erro ao carregar imóvel")
  return mapImovel(await res.json())
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
}): Promise<Imovel> {
  const res = await fetch(`${API_URL}/api/imoveis`, {
    method:  "POST",
    headers: authHeaders(true),
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
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || "Erro ao criar imóvel")
  }
  return mapImovel(await res.json())
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
  }
): Promise<Imovel> {
  const body: any = { ...dados }
  if (dados.imagens !== undefined) {
    body.imagem = dados.imagens[0] ?? null
  }

  const res = await fetch(`${API_URL}/api/imoveis/${id}`, {
    method:  "PUT",
    headers: authHeaders(true),
    body:    JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || "Erro ao atualizar imóvel")
  }
  return mapImovel(await res.json())
}

export async function apiDeletarImovel(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/imoveis/${id}`, {
    method:  "DELETE",
    headers: authHeaders(true),
  })
  if (!res.ok && res.status !== 204) {
    throw new Error("Erro ao remover imóvel")
  }
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
