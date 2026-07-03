"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ImagePlus, Video, Loader2, Star, Trash2, AlertCircle } from "lucide-react"
import { apiCriarImovel, apiUploadArquivos } from "@/lib/api"
import { Button } from "@/components/ui/button"

const TAMANHO_MAX_VIDEO_MB = 50

function getCookieValue(name: string): string {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
  if (!match) return ""
  try {
    return decodeURIComponent(match[1])
  } catch {
    return match[1]
  }
}

export default function PublicarImovelPage() {
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState("")
  const [avisos, setAvisos] = useState<string[]>([])
  const [imagensSelecionadas, setImagensSelecionadas] = useState<File[]>([])
  const [videosSelecionados, setVideosSelecionados] = useState<File[]>([])
  const [corretor, setCorretor] = useState<any>(null)

  const [formData, setFormData] = useState({
    titulo:    "",
    cidade:    "",
    preco:     "",
    descricao: "",
    whatsapp:  "",
    endereco:  "",
    tipo:      "venda",
    quartos:   "",
    banheiros: "",
    area:      "",
    vagas:     "",
    destaque:  false,
  })

  useEffect(() => {
    const emailCorretor = getCookieValue("corretor_email")
    if (emailCorretor) {
      setCorretor({ email: emailCorretor })
      return
    }

    try {
      const dados = localStorage.getItem("corretorLogado")
      if (dados) {
        setCorretor(JSON.parse(dados))
        return
      }
    } catch {
      localStorage.removeItem("corretorLogado")
    }

    router.replace("/corretor/login")
  }, [router])

  function handleChange(e: any) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function adicionarImagens(files: FileList) {
    const novas = Array.from(files)
    setImagensSelecionadas((prev) => [...prev, ...novas])
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
    setVideosSelecionados((prev) => [...prev, ...novos])
  }

  function removerImagem(index: number) {
    setImagensSelecionadas((prev) => prev.filter((_, i) => i !== index))
  }

  function removerVideo(index: number) {
    setVideosSelecionados((prev) => prev.filter((_, i) => i !== index))
  }

  async function publicar() {
    if (!formData.titulo || !formData.cidade || !formData.preco) {
      setErro("Preencha pelo menos título, cidade e preço.")
      return
    }
    if (!corretor) return

    try {
      setSalvando(true)
      setErro("")
      setAvisos([])

      // ── Upload de imagens (paralelo, pool de 3) ───────────────────────────
      const urlsImagens = await apiUploadArquivos(imagensSelecionadas)
      const imagens: string[] = []
      const falhasImagem: string[] = []
      urlsImagens.forEach((url, i) => {
        if (url) imagens.push(url)
        else falhasImagem.push(imagensSelecionadas[i].name)
      })

      if (imagensSelecionadas.length > 0 && imagens.length === 0) {
        setErro(
          "Nenhuma foto foi enviada. Verifique se o servidor da API está online e se sua sessão ainda é válida."
        )
        return
      }

      // ── Upload de vídeos (paralelo, pool de 3) ────────────────────────────
      const urlsVideos = await apiUploadArquivos(videosSelecionados)
      const videos: string[] = []
      const falhasVideo: string[] = []
      urlsVideos.forEach((url, i) => {
        if (url) videos.push(url)
        else falhasVideo.push(videosSelecionados[i].name)
      })

      // Avisa sobre falhas parciais mas não impede o salvamento
      const avisosFinal: string[] = []
      if (falhasImagem.length > 0)
        avisosFinal.push(`Foto(s) não enviada(s): ${falhasImagem.join(", ")}`)
      if (falhasVideo.length > 0)
        avisosFinal.push(`Vídeo(s) não enviado(s): ${falhasVideo.join(", ")} — verifique o tamanho (limite: ${TAMANHO_MAX_VIDEO_MB}MB).`)
      if (avisosFinal.length > 0)
        setAvisos(avisosFinal)

      // ── Salvar na API → SQL Server ─────────────────────────────────────────
      await apiCriarImovel({
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
        imagens,
        videos,
      })

      router.push("/corretor/painel")

    } catch (err: any) {
      const msg: string = err?.message ?? String(err)

      if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("networkerror")) {
        setErro("Não foi possível conectar à API. Verifique se o servidor .NET está rodando (dotnet run).")
      } else if (msg.includes("401") || msg.toLowerCase().includes("unauthorized")) {
        setErro("Sessão expirada. Faça logout e entre novamente.")
      } else {
        setErro(`Erro ao publicar: ${msg}`)
      }
    } finally {
      setSalvando(false)
    }
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
          <h1 className="text-3xl font-bold">Novo imóvel</h1>
          <p className="mt-2 text-muted-foreground">
            Preencha os dados para publicar um novo anúncio.
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
              placeholder="Título *"
              className="w-full rounded-2xl border bg-card p-4"
            />
            <input
              name="cidade"
              value={formData.cidade}
              onChange={handleChange}
              placeholder="Cidade *"
              className="w-full rounded-2xl border bg-card p-4"
            />
            <input
              name="preco"
              type="number"
              value={formData.preco}
              onChange={handleChange}
              placeholder="Preço *"
              className="w-full rounded-2xl border bg-card p-4"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <input name="quartos"   type="number" value={formData.quartos}   onChange={handleChange} placeholder="Quartos"   className="w-full rounded-2xl border bg-card p-4" />
              <input name="banheiros" type="number" value={formData.banheiros} onChange={handleChange} placeholder="Banheiros" className="w-full rounded-2xl border bg-card p-4" />
              <input name="area"      type="number" value={formData.area}      onChange={handleChange} placeholder="Área m²"   className="w-full rounded-2xl border bg-card p-4" />
              <input name="vagas"     type="number" value={formData.vagas}     onChange={handleChange} placeholder="Vagas"     className="w-full rounded-2xl border bg-card p-4" />
            </div>

            <select name="tipo" value={formData.tipo} onChange={handleChange} className="w-full rounded-2xl border bg-card p-4">
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
              placeholder="WhatsApp (ex: 5511999999999)"
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
                onChange={(e) => setFormData((prev) => ({ ...prev, destaque: e.target.checked }))}
              />
              <span className="font-medium">Destacar imóvel na home</span>
            </label>
          </div>

          {/* MÍDIAS + BOTÃO */}
          <div className="space-y-6">

            {/* IMAGENS */}
            <div className="rounded-3xl border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <ImagePlus className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Imagens</h2>
                {imagensSelecionadas.length > 0 && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {imagensSelecionadas.length} foto{imagensSelecionadas.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {imagensSelecionadas.length > 0 && (
                <div className="mb-4 grid grid-cols-2 gap-3">
                  {imagensSelecionadas.map((file, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-2xl">
                      <img
                        src={URL.createObjectURL(file)}
                        className="h-28 w-full object-cover"
                        alt=""
                      />
                      {i === 0 && (
                        <div className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-white">
                          CAPA
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removerImagem(i)}
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
                onChange={(e) => e.target.files && adicionarImagens(e.target.files)}
                className="w-full text-sm"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                A primeira foto será a capa. Selecione quantas quiser.
              </p>
            </div>

            {/* VÍDEOS */}
            <div className="rounded-3xl border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <Video className="h-5 w-5 text-red-500" />
                <h2 className="text-lg font-bold">Vídeos</h2>
                {videosSelecionados.length > 0 && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {videosSelecionados.length} vídeo{videosSelecionados.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {videosSelecionados.length > 0 && (
                <div className="mb-4 space-y-2">
                  {videosSelecionados.map((file, i) => {
                    const mb = (file.size / 1024 / 1024).toFixed(1)
                    const grande = file.size > TAMANHO_MAX_VIDEO_MB * 1024 * 1024
                    return (
                      <div key={i} className="flex items-center justify-between rounded-xl border bg-background px-3 py-2 text-sm">
                        <span className={`truncate ${grande ? "text-yellow-600" : ""}`}>
                          {file.name} <span className="text-xs text-muted-foreground">({mb}MB{grande ? " ⚠ grande" : ""})</span>
                        </span>
                        <button type="button" onClick={() => removerVideo(i)} className="ml-2 shrink-0 text-red-500 hover:text-red-700">
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
              onClick={publicar}
              disabled={salvando || !!erro}
              className="h-14 w-full rounded-2xl text-base font-semibold"
            >
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {salvando ? "Publicando..." : "Publicar imóvel"}
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}
