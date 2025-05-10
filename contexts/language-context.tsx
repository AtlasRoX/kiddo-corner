"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"


type Language = "en" | "bn"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => Promise<void>
  translate: (key: string, fallback?: string, values?: Record<string, string | number>) => string
  translations: Record<string, string>
  isLoading: boolean
}

// Default translations to use if database fetch fails
const defaultTranslations: Record<string, Record<string, string>> = {
  en: {
    "home.title": "Adorable Products for Your Little One",
    "home.description":
      "Discover our collection of high-quality baby products that bring joy and comfort to your baby's life.",
    "footer.categories": "Categories",
    "footer.newArrivals": "New Arrivals",
    "footer.babyClothes": "Baby Clothes",
    "footer.toys": "Toys & Games",
    "footer.feeding": "Feeding & Nursing",
    "footer.contactUs": "Contact Us",
    "footer.followUs": "Follow Us",
    "footer.newsletter": "Newsletter",
    "footer.subscribe": "Subscribe to get special offers and cute updates!",
    "footer.rights": "All rights reserved.",
    "admin.shippingTitle": "Shipping Costs",
    "admin.shipping.cost": "Cost (৳)",
    "admin.shipping.inside_dhaka.description": "Set shipping cost for Inside Dhaka",
    "admin.shipping.outside_dhaka.description": "Set shipping cost for Outside Dhaka",
    "admin.save": "Save",
    "checkout.shippingLocation": "Shipping Location",
    "checkout.shippingNote": "Shipping cost will be added to your total",
    "admin.orderDetails": "Order Details",
    "admin.orderItems": "Order Items",
    "admin.quantity": "Quantity",
    "admin.subtotal": "Subtotal",
    "admin.shipping": "Shipping",
    "admin.total": "Total",
    "admin.paymentInformation": "Payment Information",
    "admin.paymentMethod": "Payment Method",
    "admin.transactionId": "Transaction ID",
    "admin.paymentStatus": "Payment Status",
    "admin.customerInformation": "Customer Information",
    "admin.name": "Name",
    "admin.phone": "Phone",
    "admin.address": "Address",
    "admin.note": "Note",
    "admin.orderInformation": "Order Information",
    "admin.orderNumber": "Order Number",
    "admin.orderDate": "Order Date",
    "admin.lastUpdated": "Last Updated",
    "product.buyNow": "Buy Now",
    "product.quantity": "Quantity",
    "product.color": "Color",
    "product.size": "Size",
    "product.description": "Description",
    "product.reviews": "Reviews",
    "product.relatedProducts": "Related Products",
    "checkout.title": "Checkout",
    "checkout.customerInfo": "Customer Information",
    "checkout.paymentMethod": "Payment Method",
    "checkout.orderSummary": "Order Summary",
    "checkout.placeOrder": "Place Order",
    "checkout.productDetails": "Product Details",
    "checkout.price": "Price",
    "checkout.quantity": "Quantity",
    "checkout.total": "Total",
    "checkout.subtotal": "Subtotal",
    "checkout.shipping": "Shipping",
    "checkout.grandTotal": "Grand Total",
  },
  bn: {
    "home.title": "আপনার ছোট্ট শিশুর জন্য সুন্দর পণ্য",
    "home.description": "আপনার শিশুর জীবনে আনন্দ এবং আরাম আনে এমন উচ্চ-মানের শিশু পণ্যের আমাদের সংগ্রহ আবিষ্কার করুন।",
    "footer.categories": "বিভাগসমূহ",
    "footer.newArrivals": "নতুন আগমন",
    "footer.babyClothes": "শিশুর পোশাক",
    "footer.toys": "খেলনা এবং গেমস",
    "footer.feeding": "ফিডিং এবং নার্সিং",
    "footer.contactUs": "যোগাযোগ করুন",
    "footer.followUs": "আমাদের অনুসরণ করুন",
    "footer.newsletter": "নিউজলেটার",
    "footer.subscribe": "বিশেষ অফার এবং সুন্দর আপডেট পেতে সাবস্ক্রাইব করুন!",
    "footer.rights": "সর্বস্বত্ব সংরক্ষিত।",
    "admin.shippingTitle": "শিপিং খরচ",
    "admin.shipping.cost": "খরচ (৳)",
    "admin.shipping.inside_dhaka.description": "ঢাকার ভিতরে শিপিং খরচ সেট করুন",
    "admin.shipping.outside_dhaka.description": "ঢাকার বাইরে শিপিং খরচ সেট করুন",
    "admin.save": "সংরক্ষণ করুন",
    "checkout.shippingLocation": "শিপিং অবস্থান",
    "checkout.shippingNote": "আপনার মোট খরচের সাথে শিপিং খরচ যোগ করা হবে",
    "admin.orderDetails": "অর্ডার বিবরণ",
    "admin.orderItems": "অর্ডার আইটেম",
    "admin.quantity": "পরিমাণ",
    "admin.subtotal": "সাবটোটাল",
    "admin.shipping": "শিপিং",
    "admin.total": "মোট",
    "admin.paymentInformation": "পেমেন্ট তথ্য",
    "admin.paymentMethod": "পেমেন্ট পদ্ধতি",
    "admin.transactionId": "ট্রানজেকশন আইডি",
    "admin.paymentStatus": "পেমেন্ট স্ট্যাটাস",
    "admin.customerInformation": "গ্রাহক তথ্য",
    "admin.name": "নাম",
    "admin.phone": "ফোন",
    "admin.address": "ঠিকানা",
    "admin.note": "নোট",
    "admin.orderInformation": "অর্ডার তথ্য",
    "admin.orderNumber": "অর্ডার নম্বর",
    "admin.orderDate": "অর্ডার তারিখ",
    "admin.lastUpdated": "সর্বশেষ আপডেট",
    "product.buyNow": "এখনই কিনুন",
    "product.quantity": "পরিমাণ",
    "product.color": "রঙ",
    "product.size": "আকার",
    "product.description": "বিবরণ",
    "product.reviews": "রিভিউ",
    "product.relatedProducts": "সম্পর্কিত পণ্য",
    "checkout.title": "চেকআউট",
    "checkout.customerInfo": "গ্রাহক তথ্য",
    "checkout.paymentMethod": "পেমেন্ট পদ্ধতি",
    "checkout.orderSummary": "অর্ডার সারাংশ",
    "checkout.placeOrder": "অর্ডার করুন",
    "checkout.productDetails": "পণ্য বিবরণ",
    "checkout.price": "মূল্য",
    "checkout.quantity": "পরিমাণ",
    "checkout.total": "মোট",
    "checkout.subtotal": "সাবটোটাল",
    "checkout.shipping": "শিপিং",
    "checkout.grandTotal": "সর্বমোট",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Only run client-side code after mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Try to get language from localStorage first
    try {
      const savedLanguage = localStorage.getItem("language") as Language
      if (savedLanguage && (savedLanguage === "en" || savedLanguage === "bn")) {
        setLanguageState(savedLanguage)
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error)
    }

    // Load translations
    loadTranslations()
  }, [mounted])

  const loadTranslations = async () => {
    try {
      setIsLoading(true)

      // Initialize translations with defaults first
      const initialTranslations: Record<string, string> = {}
      Object.entries(defaultTranslations.en).forEach(([key, value]) => {
        initialTranslations[`${key}_en`] = value
      })
      Object.entries(defaultTranslations.bn).forEach(([key, value]) => {
        initialTranslations[`${key}_bn`] = value
      })

      // Set default translations immediately so we have something to work with
      setTranslations(initialTranslations)

      // Try to fetch translations from database
      try {
        // Check if translations table exists
        const { error: checkError } = await supabase.from("translations").select("count").limit(1).single()

        // If table exists, fetch translations
        if (!checkError) {
          const { data, error } = await supabase.from("translations").select("*")

          if (error) throw error

          // Process database translations
          if (data && data.length > 0) {
            const dbTranslations: Record<string, string> = {}
            interface TranslationItem {
              key: string;
              english: string | null;
              bangla: string | null;
            }

            data.forEach((item: TranslationItem) => {
              dbTranslations[`${item.key}_en`] = item.english || ""
              dbTranslations[`${item.key}_bn`] = item.bangla || ""
            })

            // Merge with default translations
            setTranslations({ ...initialTranslations, ...dbTranslations })
          }
        } else {
          console.log("Translations table doesn't exist, using default translations")
          // Table doesn't exist, we'll use the default translations
        }
      } catch (dbError) {
        console.error("Error checking translations table:", dbError)
        // Continue with default translations
      }
    } catch (error) {
      console.error("Error loading translations:", error)
      // We already set default translations above, so we're covered
    } finally {
      setIsLoading(false)
    }
  }

  const setLanguage = async (lang: Language) => {
    try {
      setLanguageState(lang)
      localStorage.setItem("language", lang)

      // Try to update language in database if site_settings table exists
      try {
        const { error: checkError } = await supabase.from("site_settings").select("count").limit(1).single()

        if (!checkError) {
          await supabase
            .from("site_settings")
            .update({ value: lang, updated_at: new Date().toISOString() })
            .eq("key", "default_language")
        }
      } catch (dbError) {
        console.error("Error updating language in database:", dbError)
        // Continue without updating database
      }
    } catch (error) {
      console.error("Error setting language:", error)
    }
  }

  const translate = (key: string, fallback?: string, values?: Record<string, string | number>): string => {
    // Get translation or fallback
    const translationKey = `${key}_${language}`
    let translated = translations[translationKey] || fallback || key

    // Replace placeholders with values if provided
    if (values) {
      Object.entries(values).forEach(([key, value]) => {
        translated = translated.replace(new RegExp(`{${key}}`, "g"), String(value))
      })
    }

    return translated
  }

  // Use a placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    // Create initial translations for SSR
    const initialTranslations: Record<string, string> = {}
    Object.entries(defaultTranslations.en).forEach(([key, value]) => {
      initialTranslations[`${key}_en`] = value
    })
    Object.entries(defaultTranslations.bn).forEach(([key, value]) => {
      initialTranslations[`${key}_bn`] = value
    })

    return (
      <LanguageContext.Provider
        value={{
          language: "en",
          setLanguage: async () => {},
          translate: (key, fallback) => fallback || key,
          translations: initialTranslations,
          isLoading: true,
        }}
      >
        {children}
      </LanguageContext.Provider>
    )
  }

  // Create a value object with memoized functions to prevent unnecessary re-renders
  const contextValue = {
    language,
    setLanguage,
    translate,
    translations,
    isLoading,
  }

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
