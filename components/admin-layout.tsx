"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SiteLogo } from "@/components/site-logo"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { TranslatedText } from "@/components/translated-text"
import {
  LayoutDashboard,
  Package,
  Settings,
  Star,
  Menu,
  LogOut,
  MessageSquare,
  CreditCard,
  ShoppingBag,
  Palette,
  Truck,
  FootprintsIcon,
} from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { signOut } = useAuth()

  // Close the mobile menu when the path changes
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const navigation = [
    {
      name: "admin.dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      current: pathname === "/admin/dashboard",
    },
    {
      name: "admin.products",
      href: "/admin/products",
      icon: Package,
      current: pathname?.startsWith("/admin/products"),
    },
    {
      name: "admin.orders",
      href: "/admin/orders",
      icon: ShoppingBag,
      current: pathname?.startsWith("/admin/orders"),
    },
    {
      name: "admin.reviews",
      href: "/admin/reviews",
      icon: Star,
      current: pathname === "/admin/reviews",
    },
    {
      name: "admin.testimonials",
      href: "/admin/testimonials",
      icon: MessageSquare,
      current: pathname === "/admin/testimonials",
    },
    {
      name: "admin.paymentMethods",
      href: "/admin/payment-methods",
      icon: CreditCard,
      current: pathname === "/admin/payment-methods",
    },
    {
      name: "admin.shipping",
      href: "/admin/shipping",
      icon: Truck,
      current: pathname === "/admin/shipping",
    },
    {
      name: "admin.systemMessages",
      href: "/admin/system-messages",
      icon: MessageSquare,
      current: pathname === "/admin/system-messages",
    },
    {
      name: "admin.appearance",
      href: "/admin/appearance",
      icon: Palette,
      current: pathname === "/admin/appearance",
    },
    {
      name: "admin.footer",
      href: "/admin/footer",
      icon: FootprintsIcon,
      current: pathname === "/admin/footer",
    },
    {
      name: "admin.siteSettings",
      href: "/admin/site-settings",
      icon: Settings,
      current: pathname === "/admin/site-settings",
    },
  ]

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <div className="border-b">
          <div className="flex h-16 items-center px-4 md:px-6">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="grid gap-2 py-6">
                  <div className="flex items-center gap-2 px-2">
                    <SiteLogo />
                    <span className="text-lg font-semibold">Admin</span>
                  </div>
                  <ScrollArea className="h-[calc(100vh-8rem)]">
                    <div className="grid gap-2 px-2 py-4">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                            item.current
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent hover:text-accent-foreground"
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          <TranslatedText textKey={item.name} fallback={item.name.split(".").pop() || item.name} />
                        </Link>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="px-2">
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={signOut}>
                      <LogOut className="h-5 w-5" />
                      <TranslatedText textKey="admin.signOut" fallback="Sign Out" />
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2 md:ml-0 ml-4">
              <SiteLogo />
              <span className="text-lg font-semibold hidden md:inline-block">Admin</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                <TranslatedText textKey="admin.signOut" fallback="Sign Out" />
              </Button>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
          <aside className="hidden border-r bg-muted/40 md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
              <div className="flex-1">
                <div className="grid gap-1 px-3 py-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                        item.current
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <TranslatedText textKey={item.name} fallback={item.name.split(".").pop() || item.name} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
          <main className="flex flex-col">
            <div className="flex-1 space-y-4 p-5 md:p-8">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
