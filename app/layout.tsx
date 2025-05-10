import type React from "react"
import type { Metadata } from "next"
import { Inter, Hind_Siliguri, Bubblegum_Sans } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { SiteSettingsProvider } from "@/contexts/site-settings-context"
import { LanguageProvider } from "@/contexts/language-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { AppThemeProvider } from "@/contexts/app-theme-provider"
import { useLanguage } from "@/contexts/language-context"



// Load fonts outside of the component to ensure consistent rendering
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  variable: "--font-hind-siliguri",
  display: "swap",
})

const bubblegumSans = Bubblegum_Sans({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-bubblegum",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Kiddo Corner - Adorable Products for Your Little One",
  description: "Discover our collection of high-quality baby products that bring joy and comfort to your baby's life.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${hindSiliguri.variable} ${bubblegumSans.variable} font-sans`}>
        <SiteSettingsProvider>
          <LanguageProvider>
            <AppThemeProvider defaultTheme="light" attribute="class" enableSystem={false}>
              <ThemeProvider>
                {children}
                <Toaster />
              </ThemeProvider>
            </AppThemeProvider>
          </LanguageProvider>
        </SiteSettingsProvider>
      </body>
    </html>
  )
}
