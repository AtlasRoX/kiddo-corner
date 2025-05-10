"use client"

import type React from "react"

import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { TranslatedText } from "@/components/translated-text"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export function Footer() {
  const { language } = useLanguage()
  const { toast } = useToast()
  const [email, setEmail] = useState("")

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send this to your backend
    toast({
      title: "Subscribed!",
      description: `You've been subscribed to our newsletter with ${email}`,
    })
    setEmail("")
  }

  return (
    <footer className="bg-gradient-to-b from-background/50 to-background/80 border-t mt-12">
      <div className="container px-4 py-12 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About Section */}
          <div>
            <h3 className={`text-xl font-adorable mb-4 text-primary ${language === "bn" ? "bangla-text" : ""}`}>
              <TranslatedText textKey="footer.about" fallback="About Kiddo Corner" />
            </h3>
            <p className={`text-muted-foreground mb-4 ${language === "bn" ? "bangla-text" : ""}`}>
              <TranslatedText
                textKey="footer.aboutText"
                fallback="We provide high-quality baby products that bring joy and comfort to your baby's life."
              />
            </p>
          </div>

          {/* Categories Section */}
          <div>
            <h3 className={`text-xl font-adorable mb-4 text-primary ${language === "bn" ? "bangla-text" : ""}`}>
              <TranslatedText textKey="footer.categories" fallback="Categories" />
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className={`text-muted-foreground hover:text-primary transition-colors ${
                    language === "bn" ? "bangla-text" : ""
                  }`}
                >
                  <TranslatedText textKey="footer.newArrivals" fallback="New Arrivals" />
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className={`text-muted-foreground hover:text-primary transition-colors ${
                    language === "bn" ? "bangla-text" : ""
                  }`}
                >
                  <TranslatedText textKey="footer.babyClothes" fallback="Baby Clothes" />
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className={`text-muted-foreground hover:text-primary transition-colors ${
                    language === "bn" ? "bangla-text" : ""
                  }`}
                >
                  <TranslatedText textKey="footer.toys" fallback="Toys & Games" />
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className={`text-muted-foreground hover:text-primary transition-colors ${
                    language === "bn" ? "bangla-text" : ""
                  }`}
                >
                  <TranslatedText textKey="footer.feeding" fallback="Feeding & Nursing" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className={`text-xl font-adorable mb-4 text-primary ${language === "bn" ? "bangla-text" : ""}`}>
              <TranslatedText textKey="footer.contactUs" fallback="Contact Us" />
            </h3>
            <address className="not-italic text-muted-foreground space-y-2">
              <p className={language === "bn" ? "bangla-text" : ""}>123 Baby Street, Dhaka, Bangladesh</p>
              <p>
                <a href="mailto:contact@kiddocorner.com" className="hover:text-primary transition-colors">
                  contact@kiddocorner.com
                </a>
              </p>
              <p>
                <a href="tel:+8801234567890" className="hover:text-primary transition-colors">
                  +880 1234 567890
                </a>
              </p>
            </address>

            <h3 className={`text-xl font-adorable mt-6 mb-4 text-primary ${language === "bn" ? "bangla-text" : ""}`}>
              <TranslatedText textKey="footer.followUs" fallback="Follow Us" />
            </h3>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/profile.php?id=61572909826634"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Newsletter Section */}
          <div>
            <h3 className={`text-xl font-adorable mb-4 text-primary ${language === "bn" ? "bangla-text" : ""}`}>
              <TranslatedText textKey="footer.newsletter" fallback="Newsletter" />
            </h3>
            <p className={`text-muted-foreground mb-4 ${language === "bn" ? "bangla-text" : ""}`}>
              <TranslatedText textKey="footer.subscribe" fallback="Subscribe to get special offers and cute updates!" />
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background"
              />
              <Button type="submit" className="w-full">
                <TranslatedText textKey="footer.subscribeButton" fallback="Subscribe" />
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-border/40 mt-8 pt-8 text-center text-muted-foreground">
          <p className={language === "bn" ? "bangla-text" : ""}>
            © {new Date().getFullYear()} Kiddo Corner.{" "}
            <TranslatedText textKey="footer.rights" fallback="All rights reserved." />
          </p>
        </div>
      </div>
    </footer>
  )
}
