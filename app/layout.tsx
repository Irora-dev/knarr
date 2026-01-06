import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Compass - Find Your Direction',
  description: 'The command centre for life. Track nutrition, habits, and more.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-forge-black text-bone">
        {children}
      </body>
    </html>
  )
}
