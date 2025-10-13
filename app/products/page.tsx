import { ProductListingPage } from "@/components/product-listing-page"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "All Products | Kiddo Corner",
  description: "Browse our complete collection of products with advanced filtering and search options",
}

export default function ProductsPage() {
  return <ProductListingPage />
}
