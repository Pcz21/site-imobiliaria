"use client"

import { useState, useEffect } from "react"
import type { Imovel } from "@/lib/data"

interface Props {
  imovel: Imovel | null
}

function formatPreco(preco: number, tipo: string): string {
  const s = Math.round(preco).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return tipo === "aluguel" ? `R$ ${s}/mes` : `R$ ${s}`
}

export default function ImovelDetalhesClient({ imovel }: Props) {
  const [favorito, setFavorito] = useState(false)

  useEffect(() => {
    if (!imovel) return
    try {
      const ids: string[] = JSON.parse(localStorage.getItem("favoritos") || "[]")
      setFavorito(ids.includes(String(imovel.id)))
    } catch {}
  }, [imovel])

  if (!imovel) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 32, textAlign: "center" }}>
        <p style={{ color: "white", fontSize: 20, fontWeight: 700 }}>Imovel nao encontrado</p>
        <a href="/imoveis" style={{ color: "#60a5fa" }}>Ver todos os imoveis</a>
      </div>
    )
  }

  const imagens = (imovel.imagens?.length ?? 0) > 0 ? imovel.imagens! : imovel.imagem ? [imovel.imagem] : []
  const videos  = imovel.videos || []

  const digits  = (imovel.whatsapp || "").replace(/\D/g, "")
  const phone   = digits.length === 10 || digits.length === 11 ? `55${digits}` : digits
  const msgWa   = encodeURIComponent(`Ola! Tenho interesse no imovel: ${imovel.titulo}`)
  const waLink  = phone ? `https://wa.me/${phone}?text=${msgWa}` : ""

  const shareLink = `https://wa.me/?text=${encodeURIComponent(`${imovel.titulo} - Fabiju Imoveis: /imoveis/${imovel.id}`)}`

  function toggleFavorito() {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem("favoritos") || "[]")
      const id = String(imovel!.id)
      const novos = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]
      localStorage.setItem("favoritos", JSON.stringify(novos))
      setFavorito(v => !v)
    } catch {}
  }

  const btnStyle = (active?: boolean): React.CSSProperties => ({
    cursor: "pointer",
    border: active ? "1px solid #ef4444" : "1px solid #444",
    background: active ? "rgba(239,68,68,0.15)" : "transparent",
    color: active ? "#ef4444" : "#aaa",
    borderRadius: 999,
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 500,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
  })

  return (
    <div style={{ minHeight: "100vh", background: "#111", color: "white" }}>

      {/* Barra de topo */}
      <div style={{ borderBottom: "1px solid #2a2a2a", background: "#1a1a1a", padding: "12px 16px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <a href="/imoveis" style={{ color: "#aaa", textDecoration: "none", fontSize: 14 }}>Voltar</a>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={toggleFavorito} style={btnStyle(favorito)}>
              {favorito ? "Salvo" : "Salvar"}
            </button>
            <a href={shareLink} target="_blank" rel="noopener noreferrer" style={btnStyle()}>
              Compartilhar
            </a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 16px" }}>
        <div style={{ display: "grid", gap: 32, gridTemplateColumns: "1fr" }} className="lg:grid-cols-[1fr_340px]">

          {/* Coluna principal */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

            {/* Galeria — CSS scroll-snap, zero React state, funciona em qualquer mobile */}
            {imagens.length > 0 && (
              <div>
                <div
                  style={{
                    display: "flex",
                    overflowX: "auto",
                    scrollSnapType: "x mandatory",
                    WebkitOverflowScrolling: "touch",
                    borderRadius: 16,
                    background: "#000",
                    aspectRatio: "16/9",
                  }}
                >
                  {imagens.map((img, i) => (
                    <div
                      key={i}
                      style={{
                        flexShrink: 0,
                        width: "100%",
                        scrollSnapAlign: "start",
                        background: "#000",
                      }}
                    >
                      <img
                        src={img}
                        alt={`${imovel.titulo} foto ${i + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                      />
                    </div>
                  ))}
                </div>
                {imagens.length > 1 && (
                  <p style={{ margin: "8px 0 0", color: "#555", fontSize: 13, textAlign: "center" }}>
                    deslize para ver as {imagens.length} fotos
                  </p>
                )}
              </div>
            )}

            {/* Titulo e localizacao */}
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>{imovel.titulo}</h1>
              {imovel.cidade   && <p style={{ margin: "8px 0 0", color: "#888" }}>📍 {imovel.cidade}</p>}
              {imovel.endereco && <p style={{ margin: "4px 0 0", color: "#666", fontSize: 13 }}>{imovel.endereco}</p>}
            </div>

            {/* Caracteristicas */}
            {(imovel.quartos || imovel.banheiros || imovel.area || imovel.vagas) && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 12 }}>
                {imovel.quartos   ? <Stat label="Quartos"   valor={String(imovel.quartos)} />   : null}
                {imovel.banheiros ? <Stat label="Banheiros" valor={String(imovel.banheiros)} /> : null}
                {imovel.area      ? <Stat label="Area"      valor={`${imovel.area}m2`} />       : null}
                {imovel.vagas     ? <Stat label="Vagas"     valor={String(imovel.vagas)} />     : null}
              </div>
            )}

            {/* Descricao */}
            {imovel.descricao && (
              <div>
                <h2 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 700 }}>Descricao</h2>
                <p style={{ margin: 0, color: "#999", lineHeight: 1.8, whiteSpace: "pre-line" }}>{imovel.descricao}</p>
              </div>
            )}

            {/* Mapa */}
            {imovel.endereco && (
              <div>
                <h2 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 700 }}>Localizacao</h2>
                <div style={{ borderRadius: 12, overflow: "hidden" }}>
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(imovel.endereco)}&output=embed`}
                    width="100%"
                    height="280"
                    style={{ border: 0, display: "block" }}
                    loading="lazy"
                    title="Mapa"
                  />
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(imovel.endereco)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#60a5fa", fontSize: 13, marginTop: 8, display: "inline-block" }}
                >
                  Abrir no Google Maps
                </a>
              </div>
            )}

            {/* Videos */}
            {videos.length > 0 && (
              <div>
                <h2 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 700 }}>Videos</h2>
                {videos.map((v, i) => (
                  <video key={i} controls style={{ width: "100%", borderRadius: 12, marginTop: i > 0 ? 12 : 0 }}>
                    <source src={v} />
                  </video>
                ))}
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div>
            <div style={{ position: "sticky", top: 80, borderRadius: 16, border: "1px solid #2a2a2a", background: "#1a1a1a", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

              <div>
                <p style={{ margin: 0, color: "#888", fontSize: 13 }}>Valor do imovel</p>
                <p style={{ margin: "6px 0 0", color: "#60a5fa", fontWeight: 700, fontSize: 28 }}>
                  {formatPreco(imovel.preco, imovel.tipo)}
                </p>
                <span style={{
                  display: "inline-block", marginTop: 8,
                  padding: "2px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                  background: imovel.tipo === "venda" ? "rgba(37,99,235,0.2)" : "rgba(202,138,4,0.2)",
                  color: imovel.tipo === "venda" ? "#60a5fa" : "#facc15",
                }}>
                  {imovel.tipo === "venda" ? "Venda" : "Aluguel"}
                </span>
              </div>

              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "block", padding: "14px 0", borderRadius: 12, background: "#16a34a", color: "white", textAlign: "center", textDecoration: "none", fontWeight: 700, fontSize: 16 }}
                >
                  💬 Falar no WhatsApp
                </a>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={toggleFavorito}
                  style={{
                    flex: 1, padding: "12px 0", borderRadius: 12, cursor: "pointer",
                    border: favorito ? "1px solid #ef4444" : "1px solid #444",
                    background: favorito ? "rgba(239,68,68,0.15)" : "transparent",
                    color: favorito ? "#ef4444" : "#aaa",
                    fontSize: 14, fontWeight: 500,
                  }}
                >
                  {favorito ? "Salvo" : "Salvar"}
                </button>
                <a
                  href={shareLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1, padding: "12px 0", borderRadius: 12,
                    border: "1px solid #444", background: "transparent", color: "#aaa",
                    fontSize: 14, fontWeight: 500, textDecoration: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  Compartilhar
                </a>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* WhatsApp flutuante mobile */}
      {waLink && (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="lg:hidden"
          style={{ position: "fixed", bottom: 80, right: 20, zIndex: 50, display: "flex", alignItems: "center", gap: 8, padding: "14px 22px", borderRadius: 999, background: "#16a34a", color: "white", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
        >
          💬 WhatsApp
        </a>
      )}

    </div>
  )
}

function Stat({ label, valor }: { label: string; valor: string }) {
  return (
    <div style={{ borderRadius: 12, border: "1px solid #2a2a2a", padding: 16, textAlign: "center" }}>
      <p style={{ margin: 0, color: "#666", fontSize: 12 }}>{label}</p>
      <p style={{ margin: "6px 0 0", color: "white", fontWeight: 700, fontSize: 18 }}>{valor}</p>
    </div>
  )
}