"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, AlertCircle, ShoppingBag, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { createOrder, getPaymentMethods, getSystemMessage } from "@/lib/services/order-service"
import { getShippingCosts } from "@/lib/services/shipping-service"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/contexts/language-context"
import { TranslatedText } from "@/components/translated-text"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

interface ProductDetails {
  id: string
  name: string
  price: number
  images: string[]
}

interface VariationDetails {
  id: string
  color_name: string
  size_name: string
  price: number
  stock: number
}

interface PaymentMethod {
  id: number
  name: string
  type: string
  instructions?: string
  details?: any
}

interface ShippingCost {
  id: number
  location_key: string
  location_name: string
  cost: number
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { language } = useLanguage()
  const { toast } = useToast()

  const [product, setProduct] = useState<ProductDetails | null>(null)
  const [variation, setVariation] = useState<VariationDetails | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [transactionId, setTransactionId] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Shipping related states
  const [shippingCosts, setShippingCosts] = useState<ShippingCost[]>([])
  const [selectedShippingLocation, setSelectedShippingLocation] = useState<string>("inside_dhaka")
  const [shippingCost, setShippingCost] = useState<number>(0)

  // Form fields
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [customerNote, setCustomerNote] = useState("")

  // Fetch product details
  const fetchProductDetails = useCallback(async () => {
    const productId = searchParams.get("product_id")
    const variationId = searchParams.get("variation_id")
    const qty = searchParams.get("quantity")

    if (!productId) {
      setError("No product selected")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Parse quantity
      if (qty) {
        const parsedQty = Number.parseInt(qty)
        if (!isNaN(parsedQty) && parsedQty > 0) {
          setQuantity(parsedQty)
        }
      }

      // Fetch product
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("id, name, price, images")
        .eq("id", productId)
        .single()

      if (productError) throw productError
      setProduct(productData)

      // Fetch variation if provided
      if (variationId) {
        const { data: variationData, error: variationError } = await supabase
          .from("product_variations")
          .select(`
            id, 
            price, 
            stock,
            product_colors!inner(name),
            product_sizes!inner(name)
          `)
          .eq("id", variationId)
          .single()

        if (variationError) {
          console.warn("Error fetching variation:", variationError)
        } else if (variationData) {
          setVariation({
            id: variationData.id,
            price: variationData.price,
            stock: variationData.stock,
            color_name: variationData.product_colors?.name || "",
            size_name: variationData.product_sizes?.name || "",
          })
        }
      }
    } catch (error: any) {
      console.error("Error fetching product details:", error)
      setError("Failed to load product details. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  // Fetch payment methods
  const fetchPaymentMethods = useCallback(async () => {
    try {
      const methods = await getPaymentMethods()
      setPaymentMethods(methods)
      if (methods.length > 0) {
        setSelectedPaymentMethod(methods[0])
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error)
      toast({
        title: "Warning",
        description: "Could not load payment methods. Some checkout options may be unavailable.",
        variant: "destructive",
      })
    }
  }, [toast])

  // Fetch shipping costs
  const fetchShippingCosts = useCallback(async () => {
    try {
      const costs = await getShippingCosts()
      setShippingCosts(costs)

      // Set default shipping cost
      const insideDhaka = costs.find((cost) => cost.location_key === "inside_dhaka")
      if (insideDhaka) {
        setShippingCost(insideDhaka.cost)
      }
    } catch (error) {
      console.error("Error fetching shipping costs:", error)
      // Set default shipping costs if fetch fails
      setShippingCosts([
        { id: 1, location_key: "inside_dhaka", location_name: "Inside Dhaka", cost: 80 },
        { id: 2, location_key: "outside_dhaka", location_name: "Outside Dhaka", cost: 130 },
      ])
      setShippingCost(80) // Default to Inside Dhaka
    }
  }, [])

  // Initialize data
  useEffect(() => {
    fetchProductDetails()
    fetchPaymentMethods()
    fetchShippingCosts()
  }, [fetchProductDetails, fetchPaymentMethods, fetchShippingCosts])

  const handlePaymentMethodChange = (methodId: string) => {
    const method = paymentMethods.find((m) => m.id.toString() === methodId)
    if (method) {
      setSelectedPaymentMethod(method)
      setTransactionId("")
    }
  }

  const handleShippingLocationChange = (locationKey: string) => {
    setSelectedShippingLocation(locationKey)
    const location = shippingCosts.find((cost) => cost.location_key === locationKey)
    if (location) {
      setShippingCost(location.cost)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!customerName.trim()) {
      newErrors.customerName = "Name is required"
    }

    if (!customerPhone.trim()) {
      newErrors.customerPhone = "Phone number is required"
    } else if (!/^(\+?88)?01[3-9]\d{8}$/.test(customerPhone.replace(/\s/g, ""))) {
      newErrors.customerPhone = "Please enter a valid Bangladesh phone number"
    }

    if (!customerAddress.trim()) {
      newErrors.customerAddress = "Address is required"
    }

    if (selectedPaymentMethod?.type === "mobile_banking" && !transactionId.trim()) {
      newErrors.transactionId = "Transaction ID is required"
    }

    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!product || !selectedPaymentMethod) {
      toast({
        title: "Error",
        description: "Product or payment method not selected",
        variant: "destructive",
      })
      return
    }

    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      // Prepare order data
      const orderData = {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        customer_note: customerNote,
        product_id: product.id,
        variation_id: variation?.id,
        quantity,
        payment_method_id: selectedPaymentMethod.id,
        transaction_id: selectedPaymentMethod.type === "mobile_banking" ? transactionId : undefined,
        shipping_location: selectedShippingLocation,
        shipping_cost: shippingCost,
      }

      // Create order
      const result = await createOrder(orderData)

      if (!result.success) {
        throw new Error(result.error || "Failed to create order")
      }

      // Get success message
      const messageKey =
        selectedPaymentMethod.type === "cod" ? "checkout_success_cod" : "checkout_success_mobile_banking"

      const message = await getSystemMessage(messageKey)
      setSuccessMessage(message || "Thank you for your order!")

      // Show success dialog
      setShowSuccess(true)
    } catch (error: any) {
      console.error("Error submitting order:", error)
      toast({
        title: "Error",
        description: error.message || "There was an error processing your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSuccessClose = () => {
    setShowSuccess(false)
    router.push("/")
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Checkout</h1>
          <p className="mb-6 text-muted-foreground">{error}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => window.location.reload()}>Try Again</Button>
            <Button variant="outline" asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="mb-6 text-muted-foreground">The product you're trying to checkout is not available.</p>
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  const productPrice = variation ? variation.price * quantity : product.price * quantity
  const totalPrice = productPrice + shippingCost

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className={`text-3xl font-bold text-center ${language === "bn" ? "bangla-text" : ""}`}>
            <TranslatedText textKey="checkout.title" fallback="Checkout" />
          </h1>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>
                    <TranslatedText textKey="checkout.customerInfo" fallback="Customer Information" />
                  </CardTitle>
                  <CardDescription>
                    <TranslatedText
                      textKey="checkout.customerInfoDesc"
                      fallback="Please provide your contact and delivery information"
                    />
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="name" className="flex items-center justify-between">
                        <span>
                          <TranslatedText textKey="checkout.fullName" fallback="Full Name" />*
                        </span>
                        {formErrors.customerName && (
                          <span className="text-sm text-red-500 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {formErrors.customerName}
                          </span>
                        )}
                      </Label>
                      <Input
                        id="name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className={formErrors.customerName ? "border-red-500" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="flex items-center justify-between">
                        <span>
                          <TranslatedText textKey="checkout.phone" fallback="Contact Number" />*
                        </span>
                        {formErrors.customerPhone && (
                          <span className="text-sm text-red-500 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {formErrors.customerPhone}
                          </span>
                        )}
                      </Label>
                      <Input
                        id="phone"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g., 01712345678"
                        className={formErrors.customerPhone ? "border-red-500" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address" className="flex items-center justify-between">
                        <span>
                          <TranslatedText textKey="checkout.address" fallback="Delivery Address" />*
                        </span>
                        {formErrors.customerAddress && (
                          <span className="text-sm text-red-500 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {formErrors.customerAddress}
                          </span>
                        )}
                      </Label>
                      <Textarea
                        id="address"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        rows={3}
                        className={formErrors.customerAddress ? "border-red-500" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="shipping-location">
                        <TranslatedText textKey="checkout.shippingLocation" fallback="Shipping Location" />*
                      </Label>
                      <Select value={selectedShippingLocation} onValueChange={handleShippingLocationChange}>
                        <SelectTrigger id="shipping-location">
                          <SelectValue placeholder="Select shipping location" />
                        </SelectTrigger>
                        <SelectContent>
                          {shippingCosts.map((location) => (
                            <SelectItem key={location.location_key} value={location.location_key}>
                              {location.location_name} (৳{location.cost.toFixed(2)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        <TranslatedText
                          textKey="checkout.shippingNote"
                          fallback="Shipping cost will be added to your total"
                        />
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="note">
                        <TranslatedText textKey="checkout.note" fallback="Optional Note" />
                      </Label>
                      <Textarea
                        id="note"
                        value={customerNote}
                        onChange={(e) => setCustomerNote(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>
                    <TranslatedText textKey="checkout.payment" fallback="Payment Method" />
                  </CardTitle>
                  <CardDescription>
                    <TranslatedText textKey="checkout.paymentDesc" fallback="Select your preferred payment method" />
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="payment-method">
                      <TranslatedText textKey="checkout.selectPayment" fallback="Select Payment Method" />
                    </Label>
                    <Select
                      value={selectedPaymentMethod?.id.toString() || ""}
                      onValueChange={handlePaymentMethodChange}
                    >
                      <SelectTrigger id="payment-method">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.length > 0 ? (
                          paymentMethods.map((method) => (
                            <SelectItem key={method.id} value={method.id.toString()}>
                              {method.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="loading" disabled>
                            No payment methods available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedPaymentMethod?.type === "mobile_banking" && (
                    <div className="mt-4 space-y-4">
                      <div className="bg-muted p-4 rounded-md">
                        <p className="font-medium mb-2">Instructions:</p>
                        <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                          {selectedPaymentMethod.instructions}
                        </pre>
                      </div>
                      <div>
                        <Label htmlFor="transaction-id" className="flex items-center justify-between">
                          <span>Transaction ID*</span>
                          {formErrors.transactionId && (
                            <span className="text-sm text-red-500 flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {formErrors.transactionId}
                            </span>
                          )}
                        </Label>
                        <Input
                          id="transaction-id"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="Enter your transaction ID"
                          className={formErrors.transactionId ? "border-red-500" : ""}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button
                type="submit"
                className="w-full gap-2"
                size="lg"
                disabled={submitting || paymentMethods.length === 0}
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingBag className="mr-2 h-4 w-4" />
                )}
                {submitting ? (
                  <TranslatedText textKey="checkout.processing" fallback="Processing..." />
                ) : (
                  <TranslatedText textKey="checkout.placeOrder" fallback="Place Order" />
                )}
              </Button>
            </form>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>
                  <TranslatedText textKey="checkout.orderSummary" fallback="Order Summary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4 mb-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-md border bg-muted">
                    <Image
                      src={product.images?.[0] || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg"
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    {variation && (
                      <p className="text-sm text-muted-foreground">
                        {variation.color_name} / {variation.size_name}
                      </p>
                    )}
                    <p className="text-sm">
                      <TranslatedText textKey="checkout.quantity" fallback="Quantity" />: {quantity}
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      <TranslatedText textKey="checkout.subtotal" fallback="Subtotal" />
                    </span>
                    <span>৳{productPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      <TranslatedText textKey="checkout.shipping" fallback="Shipping" />
                    </span>
                    <span>৳{shippingCost.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>
                      <TranslatedText textKey="checkout.total" fallback="Total" />
                    </span>
                    <span>৳{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>

      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <TranslatedText textKey="checkout.orderSuccess" fallback="Order Placed Successfully" />
            </AlertDialogTitle>
            <AlertDialogDescription>{successMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSuccessClose}>
              <TranslatedText textKey="checkout.continue" fallback="Continue Shopping" />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
