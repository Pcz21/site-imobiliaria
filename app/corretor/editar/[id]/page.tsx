"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Trash2, ImagePlus, Video, Loader2, Star, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { apiGetImovelById, apiAtualizarImovel } from "@/lib/api"
import { Button } from "@/components/ui/button"

const TAMANHO_MAX_VIDEO_MB = 50

export default function EditarImovelPage() {
  const { id } = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState("")
  const [avisos, setAvisos] = useState<string[]>([])
  const [novasImagens, setNovasImagens] = useState<File[]>([])
  const [novosVideos, setNovosVideos] = useState<File[]>([])

  const [formData, setFormData] = useState<any>({
    titulo:    "",
    cidade:    "",
    preco:     "",
    descricao: "",
    whatsapp:  "",
    endereco:  "",
    tipo:      "venda",
    imagens:   [],
    videos:    [],
    quartos:   "",
    banheiros: "",
    area:      "",
    vagas:     "",
    destaque:  false,
  })

  useEffect(() => {
    async function carregar() {
      const imovel = await apiGetImovelById(Number(id))

      if (!imovel) {
        router.push("/corretor/painel")
        return
      }

      setFormData({
        titulo:    imovel.titulo,
        cidade:    imovel.cidade,
        preco:     String(imovel.preco),
        descricao: imovel.descricao,
        whatsapp:  imovel.whatsapp ?? "",
        endereco:  imovel.endereco ?? "",
        tipo:      imovel.tipo,
        imagens:   imovel.imagens ?? (imovel.imagem ? [imovel.imagem] : []),
        videos:    imovel.videos ?? [],
        quartos:   String(imovel.quartos ?? ""),
        banheiros: String(imovel.banheiros ?? ""),
        area:      String(imovel.area ?? ""),
        vagas:     String(imovel.vagas ?? ""),
        destaque:  imovel.destaque ?? false,
      })

      setLoading(false)
    }

    if (id) carregar()
  }, [id, router])

  function handleChange(e: any) {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  function removerImagem(index: number) {
    const lista = [...formData.imagens]
    lista.splice(index, 1)
    setFormData({ ...formData, imagens: lista })
  }

  function removerVideo(index: number) {
    const lista = [...formData.videos]
    lista.splice(index, 1)
    setFormData({ ...formData, videos: lista })
  }

  function adicionarVideos(files: FileList) {
    const novos = Array.from(files)
    const grandes = novos.filter(f => f.size > TAMANHO_MAX_VIDEO_MB * 1024 * 1024)
    if (grandes.length > 0) {
      setAvisos(prev => [
        ...prev,
        `${grandes.map(f => f.name).join(", ")} ${grandes.length > 1 ? "excedem" : "excede"} ${TAMANHO_MAX_VIDEO_MB}MB e podem falhar no upload.`
      ])
    }
    setNovosVideos(prev => [...prev, ...novos])
  }

  function gerarNomeArquivo(file: File): string {
    const ext = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() ?? "bin"
    const aleatorio = Math.random().toString(36).slice(2, 10)
    return `${Date.now()}-${aleatorio}.${ext}`
  }

  async function uploadArquivo(file: File): Promise<string | null> {
    const nome = gerarNomeArquivo(file)
    const { error } = await supabase.storage
      .from("imoveis")
      .upload(nome, file, { upsert: false })

    if (error) {
      console.error(`[upload] Falha em "${file.name}":`, error.message)
      return null
    }

    const { data } = supabase.storage.from("imoveis").getPublicUrl(nome)
    return data.publicUrl
  }

  async function salvar() {
    const token = localStorage.getItem("token")
    if (!token) {
      setErro("Sessão inválida. Faça logout e entre novamente.")
      return
    }

    try {
      setSalvando(true)
      setErro("")
      setAvisos([])

      // Upload de novas imagens
      const imagensAtualizadas = [...formData.imagens]
      const falhasImagem: string[] = []

      for (const imagem of novasImagens) {
        const url = await uploadArquivo(imagem)
        if (url) {
          imagensAtualizadas.push(url)
        } else {
          falhasImagem.push(imagem.name)
        }
      }

      // Upload de novos vídeos
      const videosAtualizados = [...formData.videos]
      const falhasVideo: string[] = []

      for (const video of novosVideos) {
        const url = await uploadArquivo(video)
        if (url) {
          videosAtualizados.push(url)
        } else {
          falhasVideo.push(video.name)
        }
      }

      // Avisos sobre falhas parciais
      const avisosFinal: string[] = []
      if (falhasImagem.length > 0)
        avisosFinal.push(`Foto(s) não enviada(s): ${falhasImagem.join(", ")}`)
      if (falhasVideo.length > 0)
        avisosFinal.push(`Vídeo(s) não enviado(s): ${falhasVideo.join(", ")} — verifique o tamanho (limite: ${TAMANHO_MAX_VIDEO_MB}MB) e as políticas do bucket.`)
      if (avisosFinal.length > 0)
        setAvisos(avisosFinal)

      await apiAtualizarImovel(Number(id), {
        titulo:    formData.titulo,
        cidade:    formData.cidade,
        preco:     Number(formData.preco),
        descricao: formData.descricao,
        whatsapp:  formData.whatsapp,
        endereco:  formData.endereco || undefined,
        tipo:      formData.tipo,
        quartos:   Number(formData.quartos) || 0,
        banheiros: Number(formData.banheiros) || 0,
        area:      Number(formData.area) || null,
        vagas:     Number(formData.vagas) || 0,
        destaque:  formData.destaque,
        imagens:   imagensAtualizadas,
        videos:    videosAtualizados,
      })

      router.push("/corretor/painel")

    } catch (err: any) {
      const msg: string = err?.message ?? String(err)

      if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("networkerror")) {
        setErro("Não foi possível conectar à API. Verifique se o servidor .NET está rodando (dotnet run).")
      } else if (msg.includes("401") || msg.toLowerCase().includes("unauthorized")) {
        setErro("Sessão expirada. Faça logout e entre novamente.")
      } else {
        setErro(`Erro ao salvar: ${msg}`)
      }
    } finally {
      setSalvando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-10">

        <div className="mb-10">
          <Link
            href="/corretor/painel"
            className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <h1 className="text-3xl font-bold">Editar imóvel</h1>
          <p className="mt-2 text-muted-foreground">
            Atualize informações, mídias e detalhes do imóvel.
          </p>
        </div>

        {/* Erro principal */}
        {erro && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {/* Avisos (falhas parciais de upload) */}
        {avisos.length > 0 && (
          <div className="mb-6 rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
            <p className="mb-1 font-semibold">Avisos:</p>
            <ul className="list-inside list-disc space-y-1">
              {avisos.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">

          {/* FORMULÁRIO */}
          <div className="space-y-5 lg:col-span-2">
            <input
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Título"
              className="w-full rounded-2xl border bg-card p-4"
            />
            <input
              name="cidade"
              value={formData.cidade}
              onChange={handleChange}
              placeholder="Cidade"
              className="w-full rounded-2xl border bg-card p-4"
            />
            <input
              name="preco"
              type="number"
              value={formData.preco}
              onChange={handleChange}
              placeholder="Preço"
              className="w-full rounded-2xl border bg-card p-4"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="quartos"
                type="number"
                value={formData.quartos}
                onChange={handleChange}
                placeholder="Quartos"
                className="w-full rounded-2xl border bg-card p-4"
              />
              <input
                name="banheiros"
                type="number"
                value={formData.banheiros}
                onChange={handleChange}
                placeholder="Banheiros"
                className="w-full rounded-2xl border bg-card p-4"
              />
              <input
                name="area"
                type="number"
                value={formData.area}
                onChange={handleChange}
                placeholder="Área m²"
                className="w-full rounded-2xl border bg-card p-4"
              />
              <input
                name="vagas"
                type="number"
                value={formData.vagas}
                onChange={handleChange}
                placeholder="Vagas"
                className="w-full rounded-2xl border bg-card p-4"
              />
            </div>

            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full rounded-2xl border bg-card p-4"
            >
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
            </select>

            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descrição"
              className="min-h-[200px] w-full rounded-2xl border bg-card p-4"
            />

            <input
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="WhatsApp"
              className="w-full rounded-2xl border bg-card p-4"
            />

            <input
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              placeholder="Endereço completo (ex: Rua das Flores, 123 - Bairro, Cidade)"
              className="w-full rounded-2xl border bg-card p-4"
            />

            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border bg-card p-5">
              <Star className="h-5 w-5 text-yellow-500" />
              <input
                type="checkbox"
                checked={formData.destaque}
                onChange={(e) =>
                  setFormData({ ...formData, destaque: e.target.checked })
                }
              />
              <span className="font-medium">Destacar imóvel na home</span>
            </label>
          </div>

          {/* MÍDIAS + BOTÃO */}
          <div className="space-y-6">

            {/* IMAGENS EXISTENTES + NOVAS */}
            <div className="rounded-3xl border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <ImagePlus className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Imagens</h2>
                {(formData.imagens?.length > 0 || novasImagens.length > 0) && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formData.imagens?.length + novasImagens.length} foto{formData.imagens?.length + novasImagens.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Fotos já salvas */}
              {formData.imagens?.length > 0 && (
                <div className="mb-4 grid grid-cols-2 gap-3">
                  {formData.imagens.map((img: string, index: number) => (
                    <div key={index} className="group relative overflow-hidden rounded-2xl">
                      <img
                        src={img}
                        className="h-28 w-full object-cover transition duration-300 group-hover:scale-105"
                        alt=""
                      />
                      {index === 0 && (
                        <div className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-white">
                          CAPA
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removerImagem(index)}
                        className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Novas fotos aguardando upload */}
              {novasImagens.length > 0 && (
                <div className="mb-4 grid grid-cols-2 gap-3">
                  {novasImagens.map((file, index) => (
                    <div key={index} className="relative overflow-hidden rounded-2xl">
                      <img
                        src={URL.createObjectURL(file)}
                        className="h-28 w-full object-cover opacity-80"
                        alt=""
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <span className="text-xs font-bold text-white">Nova</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNovasImagens(prev => prev.filter((_, i) => i !== index))}
                        className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && setNovasImagens(prev => [...prev, ...Array.from(e.target.files!)])}
                className="w-full text-sm"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                As novas fotos serão adicionadas às existentes.
              </p>
            </div>

            {/* VÍDEOS */}
            <div className="rounded-3xl border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <Video className="h-5 w-5 text-red-500" />
                <h2 className="text-lg font-bold">Vídeos</h2>
                {(formData.videos?.length > 0 || novosVideos.length > 0) && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formData.videos?.length + novosVideos.length} vídeo{formData.videos?.length + novosVideos.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Vídeos já salvos */}
              {formData.videos?.length > 0 && (
                <div className="mb-4 space-y-3">
                  {formData.videos.map((video: string, index: number) => (
                    <div key={index} className="relative">
                      <video controls className="w-full rounded-2xl">
                        <source src={video} />
                      </video>
                      <button
                        type="button"
                        onClick={() => removerVideo(index)}
                        className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Novos vídeos aguardando upload */}
              {novosVideos.length > 0 && (
                <div className="mb-4 space-y-2">
                  {novosVideos.map((file, i) => {
                    const mb = (file.size / 1024 / 1024).toFixed(1)
                    const grande = file.size > TAMANHO_MAX_VIDEO_MB * 1024 * 1024
                    return (
                      <div key={i} className="flex items-center justify-between rounded-xl border bg-background px-3 py-2 text-sm">
                        <span className={`truncate ${grande ? "text-yellow-600" : ""}`}>
                          {file.name} <span className="text-xs text-muted-foreground">({mb}MB{grande ? " ⚠ grande" : ""})</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setNovosVideos(prev => prev.filter((_, j) => j !== i))}
                          className="ml-2 shrink-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              <input
                type="file"
                multiple
                accept="video/*"
                onChange={(e) => e.target.files && adicionarVideos(e.target.files)}
                className="w-full text-sm"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Limite por arquivo: {TAMANHO_MAX_VIDEO_MB}MB (plano gratuito do Supabase).
              </p>
            </div>

            <Button
              onClick={salvar}
              disabled={salvando || !!erro}
              className="h-14 w-full rounded-2xl text-base font-semibold"
            >
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {salvando ? "Salvando alterações..." : "Salvar alterações"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
