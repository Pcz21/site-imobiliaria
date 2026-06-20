export interface Imovel {
  id: number | string

  titulo: string
  cidade: string
  preco: number
  descricao: string
  tipo: "venda" | "aluguel"

  // Mídias
  imagem?: string
  imagens?: string[]
  videos?: string[]
  capa?: string

  // Detalhes
  quartos?: number
  banheiros?: number
  area?: number
  vagas?: number

  // Status
  destaque?: boolean
  ativo?: boolean
  visualizacoes?: number

  // Corretor
  corretor_email?: string
  whatsapp?: string
  endereco?: string
  leads?: number

  // Datas
  created_at?: string
  updated_at?: string
}

export function formatarPreco(preco: number, tipo: "venda" | "aluguel"): string {
  // Regex pura — output idêntico em V8 (Node/Chrome) e JavaScriptCore (iOS Safari).
  // Intl.NumberFormat("pt-BR") usa dados ICU de versões diferentes entre as engines,
  // produzindo U+202F vs U+00A0 como separador — mismatch invisível que quebra a
  // hidratação do React 19 e exibe o error overlay bloqueando todos os eventos mobile.
  const s = Math.round(preco).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return tipo === "aluguel" ? `R$ ${s}/mês` : `R$ ${s}`
}
