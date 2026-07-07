import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { cookies } from 'next/headers'
import './globals.css'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

// Sessão ativa = token httpOnly presente e não expirado (fonte de verdade no servidor)
function sessaoAtiva(token?: string): boolean {
  if (!token) return false
  const partes = token.split('.')
  if (partes.length !== 3) return false
  try {
    const payload = JSON.parse(
      Buffer.from(partes[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    )
    if (typeof payload.exp === 'number' && Date.now() / 1000 >= payload.exp) return false
    return true
  } catch {
    return false
  }
}

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  // Base para resolver URLs relativas (ex.: imagens OG /uploads/...) no domínio público
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://fabijuimoveis.com.br'),
  title: 'Fabiju Imóveis - Imóveis em Barueri, Osasco e Região',
  description: 'Compra, venda e aluguel de imóveis em Barueri, Osasco e região. Casas, apartamentos e terrenos com atendimento personalizado e profissional.',
  openGraph: {
    title: 'Fabiju Imóveis - Imóveis em Barueri, Osasco e Região',
    description: 'Compra, venda e aluguel de imóveis em Barueri, Osasco e região.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Fabiju Imóveis',
    // Capa oficial do link (WhatsApp/redes). Sem og:image definida, os apps
    // usavam um cache antigo do site (versão escura).
    images: [{ url: '/hero.jpg', width: 1920, height: 1080, alt: 'Fabiju Imóveis' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fabiju Imóveis - Imóveis em Barueri, Osasco e Região',
    description: 'Compra, venda e aluguel de imóveis em Barueri, Osasco e região.',
    images: ['/hero.jpg'],
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const token = (await cookies()).get('token')?.value
  const loggedIn = sessaoAtiva(token)

  return (
    <html lang="pt-BR" className="bg-background">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased min-h-screen flex flex-col pb-16 md:pb-0`}>
        <Header loggedIn={loggedIn} />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
