"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Home, Building2, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">
            PCZ <span className="text-primary">Imóveis</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <Home className="h-4 w-4" />
            Início
          </Link>
          <Link
            href="/imoveis"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <Building2 className="h-4 w-4" />
            Imóveis
          </Link>
          <Link href="/corretor/login">
            <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <User className="h-4 w-4" />
              Sou Corretor
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container mx-auto flex flex-col gap-4 p-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="h-4 w-4" />
              Início
            </Link>
            <Link
              href="/imoveis"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              <Building2 className="h-4 w-4" />
              Imóveis
            </Link>
            <Link href="/corretor/login" onClick={() => setIsMenuOpen(false)}>
              <Button variant="outline" className="w-full gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <User className="h-4 w-4" />
                Sou Corretor
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
