"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Code2,
  Linkedin,
  MessageCircle,
  ExternalLink,
  Send,
  Mail,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const LINKEDIN = "https://www.linkedin.com/in/paulo-c%C3%A9zar-silva-dos-santos-836455276"
const WHATSAPP = "https://wa.me/5511915770416"

const tecnologias = [
  { nome: "Next.js",       cor: "bg-black text-white dark:bg-white dark:text-black" },
  { nome: "React",         cor: "bg-blue-500 text-white" },
  { nome: "TypeScript",    cor: "bg-blue-700 text-white" },
  { nome: "Tailwind CSS",  cor: "bg-cyan-500 text-white" },
  { nome: "C#",            cor: "bg-purple-600 text-white" },
  { nome: "ASP.NET Core",  cor: "bg-violet-700 text-white" },
  { nome: "SQL Server",    cor: "bg-red-600 text-white" },
  { nome: "Node.js",       cor: "bg-green-600 text-white" },
]

const projetos = [
  {
    nome: "Fabiju Imóveis",
    descricao: "Plataforma imobiliária completa com painel administrativo, autenticação JWT e API ASP.NET Core.",
    tecnologias: ["Next.js", "TypeScript", "C#", "ASP.NET Core", "SQL Server"],
    link: "/",
  },
]

export default function DesenvolvedorPage() {
  const [form, setForm] = useState({ nome: "", email: "", mensagem: "" })
  const [enviado, setEnviado] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const texto = encodeURIComponent(
      `Olá Paulo! Me chamo ${form.nome} (${form.email}).\n\n${form.mensagem}`
    )
    window.open(`${WHATSAPP}?text=${texto}`, "_blank")
    setEnviado(true)
    setForm({ nome: "", email: "", mensagem: "" })
    setTimeout(() => setEnviado(false), 4000)
  }

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* HERO */}
      <section className="border-b bg-card">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Code2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Paulo Cézar
          </h1>
          <p className="mt-2 text-xl font-medium text-primary">
            Desenvolvedor Full Stack
          </p>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Desenvolvedor especializado em Next.js, React, TypeScript, C#, ASP.NET Core e SQL Server.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild className="gap-2">
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-16">

        {/* TECNOLOGIAS */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Tecnologias</h2>
          <div className="flex flex-wrap gap-2">
            {tecnologias.map(t => (
              <span
                key={t.nome}
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${t.cor}`}
              >
                {t.nome}
              </span>
            ))}
          </div>
        </section>

        {/* PORTFÓLIO */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Portfólio</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projetos.map(p => (
              <Card key={p.nome} className="rounded-2xl hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg">{p.nome}</h3>
                    <Link
                      href={p.link}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground">{p.descricao}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tecnologias.map(t => (
                      <span
                        key={t}
                        className="rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CONTATO */}
        <section>
          <h2 className="mb-2 text-2xl font-bold">Contato</h2>
          <p className="mb-6 text-muted-foreground">
            Tem um projeto em mente? Vamos conversar.
          </p>

          <div className="grid gap-8 lg:grid-cols-2">

            {/* LINKS RÁPIDOS */}
            <div className="space-y-4">
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl border bg-card p-5 hover:border-primary transition-colors group"
              >
                <div className="rounded-xl bg-green-500/10 p-3">
                  <MessageCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="font-medium group-hover:text-primary transition-colors">WhatsApp</p>
                  <p className="text-sm text-muted-foreground">Resposta rápida</p>
                </div>
                <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
              </a>

              <a
                href={LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl border bg-card p-5 hover:border-primary transition-colors group"
              >
                <div className="rounded-xl bg-blue-500/10 p-3">
                  <Linkedin className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium group-hover:text-primary transition-colors">LinkedIn</p>
                  <p className="text-sm text-muted-foreground">Perfil profissional</p>
                </div>
                <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
              </a>

              <div className="flex items-center gap-4 rounded-2xl border bg-card p-5">
                <div className="rounded-xl bg-primary/10 p-3">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">E-mail</p>
                  <p className="text-sm text-muted-foreground">paulo.cezar.santos2006@gmail.com</p>
                </div>
              </div>
            </div>

            {/* FORMULÁRIO */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Nome</label>
                <input
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  placeholder="Seu nome"
                  className="w-full rounded-xl border bg-input px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">E-mail</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="seu@email.com"
                  className="w-full rounded-xl border bg-input px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Mensagem</label>
                <textarea
                  name="mensagem"
                  value={form.mensagem}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Descreva seu projeto ou dúvida..."
                  className="w-full resize-none rounded-xl border bg-input px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>

              {enviado ? (
                <div className="flex items-center gap-2 rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  Mensagem aberta no WhatsApp!
                </div>
              ) : (
                <Button type="submit" className="w-full gap-2">
                  <Send className="h-4 w-4" />
                  Enviar via WhatsApp
                </Button>
              )}
            </form>

          </div>
        </section>

      </div>
    </div>
  )
}