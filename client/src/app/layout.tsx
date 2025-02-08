import './globals.css'
import type { Metadata } from 'next'
import { StarknetProvider } from '@/providers/StarknetProvider'
import { Header } from '@/components/Header'

export const metadata: Metadata = {
  title: 'Grid Equipment Game',
  description: 'A grid-based equipment management game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <StarknetProvider>
          <Header />
          <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
        </StarknetProvider>
      </body>
    </html>
  )
}
