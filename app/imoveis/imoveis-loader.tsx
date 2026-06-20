"use client"

// Sem ssr:false — importação direta evita spinner infinito no mobile
// A correção do Intl.NumberFormat em lib/data.ts já eliminou o hydration mismatch
export { default } from "./imoveis-client"