export interface Imovel {
  id: string
  titulo: string
  cidade: string
  preco: number
  descricao: string
  imagem: string
  tipo: "venda" | "aluguel"
  quartos?: number
  banheiros?: number
  area?: number
  destaque?: boolean

 
  corretorEmail?: string
}

// fallback
const imoveisPadrao: Imovel[] = []


// FORMATAR PREÇO

export function formatarPreco(preco: number, tipo: "venda" | "aluguel"): string {
  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return tipo === "aluguel"
    ? `${formatter.format(preco)}/mês`
    : formatter.format(preco)
}
// PEGAR IMÓVEIS

export function getImoveis(): Imovel[] {
  if (typeof window === "undefined") return imoveisPadrao

  try {
    const dados = localStorage.getItem("imoveis")
    return dados ? JSON.parse(dados) : imoveisPadrao
  } catch {
    return imoveisPadrao
  }
}

// PEGAR POR ID

export function getImovelById(id: string): Imovel | undefined {
  const lista = getImoveis()
  return lista.find((imovel) => imovel.id === id)
}

// DESTAQUE

export function getImoveisDestaque(): Imovel[] {
  const lista = getImoveis()
  return lista.filter((imovel) => imovel.destaque)
}


// IMÓVEIS DO CORRETOR

export function getImoveisDoCorretor(email: string): Imovel[] {
  const lista = getImoveis()
  return lista.filter((imovel) => imovel.corretorEmail === email)
}


// ADICIONAR IMÓVEL

export function adicionarImovel(imovel: Imovel) {
  const lista = getImoveis()
  lista.push(imovel)
  localStorage.setItem("imoveis", JSON.stringify(lista))
}

// REMOVER IMÓVEL

export function removerImovel(id: string) {
  const lista = getImoveis().filter((imovel) => imovel.id !== id)
  localStorage.setItem("imoveis", JSON.stringify(lista))
}