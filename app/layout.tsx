import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ChatBot } from "@/components/ChatBot" 

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Smart Garden Dashboard",
  description: "Monitor and control your smart garden",
  generator: "v0.dev",
  icons: {
    icon: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}

          {/* Global floating chatbot */}
          <ChatBot />
        </ThemeProvider>
      </body>
    </html>
  )
}
