import type { Metadata } from 'next'
import { Geist, Geist_Mono, Audiowide, Rajdhani } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _audiowide = Audiowide({ weight: "400", subsets: ["latin"] });
const _rajdhani = Rajdhani({ weight: ["300", "400", "500", "600", "700"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'ChoreWars <3',
  description: 'Created with v0',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

import { AuthGuard } from '@/components/auth/AuthGuard'
import { SyncManager } from '@/components/SyncManager'
import { AIChatbot } from '@/components/AIChatbot'
import { ClientOnly } from '@/components/ClientOnly'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${_geist.className} font-sans antialiased bg-background text-foreground`}>
        <AuthGuard>
          {/* <ClientOnly>
            <SyncManager />
            <AIChatbot />
          </ClientOnly> */}
          {children}
        </AuthGuard>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
