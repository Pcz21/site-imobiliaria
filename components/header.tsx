"use client"

import Link from "next/link"
import { useState, useEffect, useCallback, useRef } from "react"
import { usePathname } from "next/navigation"
import { Menu, X, Home, Building2, User, LogOut, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [logado, setLogado] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // Ref para o botão hamburger — usamos listener nativo em vez de onClick do React
  // porque o sistema de eventos sintéticos do React é interceptado pelo iOS Safari
  // em elementos sticky com backdrop-filter, causando taps sem resposta.
  const hamburgerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    setLogado(!!localStorage.getItem("corretorLogado"))
  }, [mounted, pathname])

  useEffect(() => { setIsMenuOpen(false) }, [pathname])

  // Listener nativo — bypassa o React e garante resposta ao toque no iOS
  useEffect(() => {
    const el = hamburgerRef.current
    if (!el) return

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault()       // impede o click sintético posterior (evita duplo disparo)
      e.stopPropagation()
      setIsMenuOpen(prev => !prev)
    }

    // passive: false obrigatório para poder chamar preventDefault()
    el.addEventListener("touchend", onTouchEnd, { passive: false })
    return () => el.removeEventListener("touchend", onTouchEnd)
  }, [])  // deps vazio — setIsMenuOpen é estável, o ref persiste

  const closeMenu = useCallback(() => setIsMenuOpen(false), [])

  const logout = useCallback(() => {
    localStorage.removeItem("corretorLogado")
    localStorage.removeItem("token")
    document.cookie = "token=; path=/; max-age=0"
    setLogado(false)
    setIsMenuOpen(false)
    window.location.href = "/"
  }, [])

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border">

        {/* Camada visual com blur — aria-hidden e sem pointer-events para não bloquear toques */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-background/95"
          style={{
            WebkitBackdropFilter: "blur(10px)",
            backdropFilter: "blur(10px)",
            pointerEvents: "none",
          }}
        />

        {/* Camada de conteúdo interativo — sem backdrop-filter nem transform */}
        <div className="relative container mx-auto flex h-16 items-center justify-between px-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">
              FABIJU <span className="text-primary">Imóveis</span>
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
              <Home className="h-4 w-4" />
              Início
            </Link>
            <Link href="/imoveis" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
              <Building2 className="h-4 w-4" />
              Imóveis
            </Link>
            {mounted && (
              logado ? (
                <div className="flex items-center gap-3">
                  <Link href="/corretor/painel">
                    <Button variant="outline" className="gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Painel
                    </Button>
                  </Link>
                  <Button onClick={logout} variant="destructive" size="sm" className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                </div>
              ) : (
                <Link href="/corretor/login">
                  <Button variant="outline" className="gap-2">
                    <User className="h-4 w-4" />
                    Área administrativa
                  </Button>
                </Link>
              )
            )}
          </nav>

          {/* Botão hamburger
              - ref={hamburgerRef}: listener nativo cuida do iOS
              - onClick: fallback para desktop (mouse)
              - sem onTouchEnd no JSX para evitar duplo disparo
          */}
          <button
            ref={hamburgerRef}
            type="button"
            className="md:hidden flex h-12 w-12 items-center justify-center rounded-lg"
            onClick={() => setIsMenuOpen(prev => !prev)}
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMenuOpen}
            style={{
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
              userSelect: "none",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

        </div>
      </header>

      {/* Menu mobile — position:fixed fora do header para não herdar o stacking context */}
      {isMenuOpen && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 md:hidden"
          style={{ top: "64px" }}
        >
          {/* Overlay — fecha ao tocar fora.
              onTouchEnd com preventDefault garante resposta no iOS
              (onClick em divs nem sempre dispara em iOS Safari) */}
          <div
            className="absolute inset-0"
            aria-hidden="true"
            style={{ cursor: "pointer" }}
            onClick={closeMenu}
            onTouchEnd={(e) => { e.preventDefault(); closeMenu() }}
          />

          {/* Painel — translateZ força compositing próprio, separa do header */}
          <div
            className="relative z-10 border-b bg-background shadow-lg"
            style={{ WebkitTransform: "translateZ(0)", transform: "translateZ(0)" }}
          >
            <nav className="container mx-auto flex flex-col gap-1 p-4">

              <Link
                href="/"
                className="flex items-center gap-2 rounded-lg px-3 py-4 text-sm font-medium active:bg-accent"
                onClick={closeMenu}
                style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
              >
                <Home className="h-4 w-4" />
                Início
              </Link>

              <Link
                href="/imoveis"
                className="flex items-center gap-2 rounded-lg px-3 py-4 text-sm font-medium active:bg-accent"
                onClick={closeMenu}
                style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
              >
                <Building2 className="h-4 w-4" />
                Imóveis
              </Link>

              <div className="my-2 border-t" />

              {mounted && logado ? (
                <>
                  <Link
                    href="/corretor/painel"
                    onClick={closeMenu}
                    style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
                  >
                    <Button className="w-full">Painel</Button>
                  </Link>
                  <Button
                    onClick={logout}
                    variant="destructive"
                    className="mt-2 w-full"
                    style={{ touchAction: "manipulation" }}
                  >
                    Sair
                  </Button>
                </>
              ) : (
                <Link
                  href="/corretor/login"
                  onClick={closeMenu}
                  style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
                >
                  <Button className="w-full">Área administrativa</Button>
                </Link>
              )}

            </nav>
          </div>
        </div>
      )}
    </>
  )
}
