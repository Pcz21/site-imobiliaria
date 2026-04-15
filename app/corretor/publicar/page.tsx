"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function PublicarImovelPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    titulo: "",
    cidade: "",
    preco: "",
    tipo: "venda",
    descricao: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 🔥 pegar corretor logado
      const dadosCorretor = localStorage.getItem("corretor")

      if (!dadosCorretor) {
        alert("Você precisa estar logado")
        router.push("/corretor/login")
        return
      }

      const corretor = JSON.parse(dadosCorretor)

      const novoImovel = {
        id: Date.now().toString(),
        titulo: formData.titulo,
        cidade: formData.cidade,
        preco: Number(formData.preco),
        descricao: formData.descricao,
        imagem: "/placeholder-property-1.jpg",
        tipo: formData.tipo,

        // 🔥 ESSA LINHA RESOLVE TUDO
        corretorEmail: corretor.email,
      }

      const lista = JSON.parse(localStorage.getItem("imoveis") || "[]")

      lista.push(novoImovel)

      localStorage.setItem("imoveis", JSON.stringify(lista))

      setSuccess(true)

      setTimeout(() => {
        router.push("/corretor/painel")
      }, 1500)

    } catch (error) {
      alert("Erro ao publicar imóvel")
      console.error(error)
    }

    setIsLoading(false)
  }

  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <Check className="mx-auto mb-4 h-10 w-10 text-green-500" />
            <h2 className="text-2xl font-bold">Publicado com sucesso!</h2>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <section className="border-b py-4">
        <div className="container mx-auto px-4">
          <Link href="/corretor/painel">
            <ArrowLeft className="inline mr-2" />
            Voltar
          </Link>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-xl">
        <Card>
          <CardHeader>
            <h1 className="text-xl font-bold text-center">Publicar Imóvel</h1>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              <input
                name="titulo"
                placeholder="Título"
                value={formData.titulo}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded"
              />

              <input
                name="cidade"
                placeholder="Cidade"
                value={formData.cidade}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded"
              />

              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="venda">Venda</option>
                <option value="aluguel">Aluguel</option>
              </select>

              <input
                name="preco"
                type="number"
                placeholder="Preço"
                value={formData.preco}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded"
              />

              <textarea
                name="descricao"
                placeholder="Descrição"
                value={formData.descricao}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded"
              />

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Publicando..." : "Publicar"}
              </Button>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}