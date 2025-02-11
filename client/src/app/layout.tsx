import './globals.css'
import type { Metadata } from 'next'
import { StarknetProvider } from '@/providers/StarknetProvider'
import { Header } from '@/components/Header'
import { WalletGuard } from '@/components/WalletGuard'
import { UserProvider } from '@/contexts/UserContext'

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
          <UserProvider>
            <Header />
            <WalletGuard>
              <main className="max-w-7xl mx-auto px-4 py-1">{children}</main>
            </WalletGuard>
          </UserProvider>
        </StarknetProvider>
      </body>
    </html>
  )
}
