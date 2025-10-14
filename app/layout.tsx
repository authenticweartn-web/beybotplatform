import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Suspense } from "react"
import { PageTracker } from "@/components/page-tracker"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "BeyBot - AI-Powered Sales Agents",
  description: "AI-Powered Sales Agents for E-commerce",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body>
        <Suspense fallback={null}>
          <Providers>
            <PageTracker />
            {children}
          </Providers>
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
