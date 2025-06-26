import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CompliCal - Compliance Deadline API',
  description: 'A trusted, developer-first API for government and compliance deadlines in Australia and New Zealand',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="/config.js" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}