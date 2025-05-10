"use client"

import type React from "react"

import { useFooter } from "@/contexts/footer-context"
import { TranslatedText } from "@/components/translated-text"
import { useState, useEffect } from "react"
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"

export function DynamicFooter() {
  const { sections, loading, error } = useFooter()
  const [email, setEmail] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // During SSR or before client hydration, render a simple placeholder
  if (!mounted) {
    return (
      <footer className="bg-gray-100 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="h-40"></div>
        </div>
      </footer>
    )
  }

  if (loading) {
    return (
      <footer className="bg-gray-100 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse h-40"></div>
        </div>
      </footer>
    )
  }

  if (error || !sections || sections.length === 0) {
    // Fallback footer if there's an error or no sections
    return (
      <footer className="bg-gray-100 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                <TranslatedText text="About Us" />
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                <TranslatedText text="Kiddo Corner provides high-quality baby products that bring joy and comfort to your baby's life." />
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">
                <TranslatedText text="Quick Links" />
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary">
                    <TranslatedText text="Home" />
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-gray-600 dark:text-gray-400 hover:text-primary">
                    <TranslatedText text="Products" />
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">
                <TranslatedText text="Contact Us" />
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                <TranslatedText text="Email: contact@kiddocorner.com" />
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-6 text-center text-gray-500 dark:text-gray-400">
            <p>
              © {new Date().getFullYear()} Kiddo Corner. <TranslatedText text="All rights reserved." />
            </p>
          </div>
        </div>
      </footer>
    )
  }

  // Sort sections by display_order
  const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order)

  // Helper function to render social icons
  const renderSocialIcon = (icon: string) => {
    switch (icon.toLowerCase()) {
      case "facebook":
        return <Facebook className="h-5 w-5" />
      case "instagram":
        return <Instagram className="h-5 w-5" />
      case "twitter":
        return <Twitter className="h-5 w-5" />
      case "linkedin":
        return <Linkedin className="h-5 w-5" />
      case "youtube":
        return <Youtube className="h-5 w-5" />
      default:
        return null
    }
  }

  // Helper function to render contact icons
  const renderContactIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "email":
        return <Mail className="h-5 w-5 mr-2" />
      case "phone":
        return <Phone className="h-5 w-5 mr-2" />
      case "address":
        return <MapPin className="h-5 w-5 mr-2" />
      default:
        return null
    }
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically handle the newsletter subscription
    alert(`Subscribed with email: ${email}`)
    setEmail("")
  }

  // Implement the actual footer with the sections data
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {sortedSections.map((section) => (
            <div key={section.id}>
              <h3 className="text-lg font-semibold mb-4 bangla-text">{section.title}</h3>
              {section.type === "links" && section.links && (
                <ul className="space-y-2">
                  {section.links.map((link: any) => (
                    <li key={link.id}>
                      <Link href={link.url} className="text-gray-600 dark:text-gray-400 hover:text-primary bangla-text">
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {section.type === "text" && (
                <p className="text-gray-600 dark:text-gray-400 bangla-text">{section.content}</p>
              )}
              {section.type === "social" && section.social_links && (
                <div className="flex space-x-4">
                  {section.social_links.map((social: any) => (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-400 hover:text-primary"
                      aria-label={social.platform}
                    >
                      {renderSocialIcon(social.platform)}
                    </a>
                  ))}
                </div>
              )}
              {section.type === "contact" && section.contact_items && (
                <ul className="space-y-2">
                  {section.contact_items.map((item: any) => (
                    <li key={item.id} className="flex items-center text-gray-600 dark:text-gray-400 bangla-text">
                      {renderContactIcon(item.type)}
                      {item.value}
                    </li>
                  ))}
                </ul>
              )}
              {section.type === "newsletter" && (
                <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                  <div className="flex">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email"
                      className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary flex-grow"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary/90 transition-colors"
                    >
                      <TranslatedText text="Subscribe" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-6 text-center text-gray-500 dark:text-gray-400">
          <p>
            © {new Date().getFullYear()} Kiddo Corner. <TranslatedText text="All rights reserved." />
          </p>
        </div>
      </div>
    </footer>
  )
}
