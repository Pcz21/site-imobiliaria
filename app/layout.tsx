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
  title: 'Fabiju Imóveis - Encontre o Imóvel Ideal',
  description: 'Plataforma imobiliária para compra, venda e aluguel de imóveis. Atendimento personalizado e profissional.',
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
