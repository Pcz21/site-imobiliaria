"use client"

import { useState, useEffect } from "react"

export default function LoginAutoRedirect() {
  const [passos, setPassos]     = useState<string[]>([])
  const [cookieStr, setCookieStr] = useState("")
  const [pathname, setPathname]   = useState("")

  function add(txt: string) {
    setPassos(prev => [...prev, txt])
  }

  useEffect(() => {
    setPathname(window.location.pathname)
    setCookieStr(document.cookie)

    // PASSO 1: captura envio do formulário
    const form = document.querySelector("form")
    function handleSubmit() {
      add("PASSO 1 — formulário enviado")
    }
    form?.addEventListener("submit", handleSubmit)

    // Polling: detecta quando token aparecer nos cookies
    const id = setInterval(() => {
      const c = document.cookie
      setCookieStr(c)
      setPathname(window.location.pathname)

      const temToken = /(?:^|;\s*)token=([^;]+)/.test(c)
      if (temToken) {
        clearInterval(id)
        setPassos(prev => {
          if (prev.some(p => p.startsWith("PASSO 3"))) return prev
          return [
            ...prev,
            "PASSO 2 — API autenticou OK",
            "PASSO 3 — cookies criados no browser",
            "PASSO 4 — navegando para painel...",
          ]
        })
        // Reload completo: garante JS atualizado no painel (decodeURIComponent do email)
        window.location.href = "/corretor/painel"
      }
    }, 300)

    return () => {
      form?.removeEventListener("submit", handleSubmit)
      clearInterval(id)
    }
  }, [])

  const corAmarelo = "#facc15"
  const corVerde   = "#4ade80"
  const corLaranja = "#f97316"

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 99999,
      background: "#0a0a0a",
      color: "#fff",
      fontFamily: "monospace",
      fontSize: 13,
      borderTop: `4px solid ${corAmarelo}`,
      maxHeight: "52vh",
      overflowY: "auto",
      padding: "10px 14px",
    }}>
      <div style={{ fontWeight: 700, color: corAmarelo, fontSize: 15, marginBottom: 8 }}>
        📱 DIAGNÓSTICO MOBILE
      </div>

      <div style={{ marginBottom: 3, fontSize: 12 }}>
        <span style={{ color: "#888" }}>URL: </span>
        <span>{pathname}</span>
      </div>
      <div style={{ marginBottom: 8, wordBreak: "break-all", fontSize: 11 }}>
        <span style={{ color: "#888" }}>Cookies: </span>
        <span>{cookieStr || "(nenhum)"}</span>
      </div>

      {passos.length === 0 ? (
        <div style={{ color: "#666" }}>Aguardando envio do formulário...</div>
      ) : (
        passos.map((p, i) => (
          <div key={i} style={{
            padding: "5px 10px",
            marginBottom: 4,
            borderRadius: 4,
            background: p.includes("aguardando") ? "#2a1000" : "#0a1f0a",
            color:      p.includes("aguardando") ? corLaranja : corVerde,
            borderLeft: `4px solid ${p.includes("aguardando") ? corLaranja : corVerde}`,
          }}>
            {p.includes("aguardando") ? "⚠️" : "✅"} {p}
          </div>
        ))
      )}
    </div>
  )
}