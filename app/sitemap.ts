import type { MetadataRoute } from "next"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
const API_URL = process.env.NEXT_PUBLIC_API_URL  || "http://localhost:5162"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const estaticas: MetadataRoute.Sitemap = [
    { url: APP_URL,             lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${APP_URL}/imoveis`, lastModified: new Date(), changeFrequency: "daily",  priority: 0.9 },
  ]

  let dinamicas: MetadataRoute.Sitemap = []

  try {
    const res = await fetch(`${API_URL}/api/imoveis`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const imoveis: any[] = await res.json()
      dinamicas = imoveis.map((im) => ({
        url:             `${APP_URL}/imoveis/${im.id}`,
        lastModified:    new Date(im.atualizadoEm ?? im.criadoEm),
        changeFrequency: "weekly" as const,
        priority:        0.8,
      }))
    }
  } catch {
    // Se a API estiver fora, retorna apenas as páginas estáticas
  }

  return [...estaticas, ...dinamicas]
}
