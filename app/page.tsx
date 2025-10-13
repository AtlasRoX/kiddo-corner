import React from 'react'
import { ProductGrid } from "@/components/product-grid"
import { SearchBar } from "@/components/search-bar"
import { ThemeToggle } from "@/components/theme-toggle"
import { TestimonialsSection } from "@/components/testimonials-section"
import { Footer } from "@/components/footer"
import { SiteLogo } from "@/components/site-logo"
import { LanguageSwitcher } from "@/components/language-switcher"
import Link from "next/link"
import { HomeHero } from "@/components/home-hero"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <header className="flex items-center justify-between mb-8">
          
            <SiteLogo />
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <HomeHero />

        <div className="max-w-2xl mx-auto mb-12">
          <SearchBar />
        </div>

        <div className="py-8">
          <ProductGrid />
        </div>

        <div className="py-8">
          <TestimonialsSection />
        </div>

        <Footer />
      </div>
    </main>
  )
}
