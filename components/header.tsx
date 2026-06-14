"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Home, Building2, Heart, User, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [logado, setLogado]   = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    setLogado(!!localStorage.getItem("corretorLogado"))
  }, [mounted, pathname])

  function logout() {
    localStorage.removeItem("corretorLogado")
    localStorage.removeItem("token")
    document.cookie = "token=; path=/; max-age=0"
    window.location.href = "/"
  }

  return (
    <>
      {/* ── HEADER DESKTOP ── */}
      <header className="sticky top-0 z-50 w-full border-b border-border">

        {/* Camada visual com blur */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-background/95"
          style={{
            WebkitBackdropFilter: "blur(10px)",
            backdropFilter: "blur(10px)",
            pointerEvents: "none",
          }}
        />

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

          {/* Nav desktop — oculta no mobile (que usa bottom nav) */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
              <Home className="h-4 w-4" />
              Início
            </Link>
            <Link href="/imoveis" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
              <Building2 className="h-4 w-4" />
              Imóveis
            </Link>
            <Link href="/favoritos" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
              <Heart className="h-4 w-4" />
              Favoritos
            </Link>
            {mounted && (
              logado ? (
                <div className="flex items-center gap-3">
                  <Button asChild variant="outline" className="gap-2">
                    <Link href="/corretor/painel">
                      <LayoutDashboard className="h-4 w-4" />
                      Painel
                    </Link>
                  </Button>
                  <Button onClick={logout} variant="destructive" size="sm">
                    Sair
                  </Button>
                </div>
              ) : (
                <Button asChild variant="outline" className="gap-2">
                  <Link href="/corretor/login">
                    <User className="h-4 w-4" />
                    Área administrativa
                  </Link>
                </Button>
              )
            )}
          </nav>

        </div>
      </header>

      {/* ── BOTTOM NAV MOBILE ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t bg-background"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <Link
          href="/"
          className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors ${
            pathname === "/" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Home className="h-5 w-5" />
          Início
        </Link>

        <Link
          href="/imoveis"
          className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors ${
            pathname.startsWith("/imoveis") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Building2 className="h-5 w-5" />
          Imóveis
        </Link>

        <Link
          href="/favoritos"
          className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors ${
            pathname === "/favoritos" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Heart className="h-5 w-5" />
          Favoritos
        </Link>

        <Link
          href="/corretor/login"
          className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors ${
            pathname.startsWith("/corretor") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <User className="h-5 w-5" />
          Admin
        </Link>
      </nav>
    </>
  )
}