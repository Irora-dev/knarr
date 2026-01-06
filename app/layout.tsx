import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Knarr - The Command Centre for Life',
  description: 'Track nutrition, habits, goals, and more. Navigate your life with purpose.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-forge-black text-bone">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
