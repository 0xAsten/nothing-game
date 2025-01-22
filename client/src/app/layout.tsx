import './globals.css'
import type { Metadata } from 'next'

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
      <body>{children}</body>
    </html>
  )
}
