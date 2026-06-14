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
  const formatter = new Intl.NumberFormat("pt-BR", {
    style:                 "currency",
    currency:              "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return tipo === "aluguel" ? `${formatter.format(preco)}/mês` : formatter.format(preco)
}
