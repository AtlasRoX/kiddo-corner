"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { getOrderById, updateOrderStatus } from "@/lib/services/order-service"
import { Loader2, ArrowLeft } from "lucide-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { TranslatedText } from "@/components/translated-text"

export default function OrderDetailsPage() {
  const params = useParams()
  const { toast } = useToast()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!params.id) return

      try {
        const orderData = await getOrderById(params.id as string)
        setOrder(orderData)
      } catch (error) {
        console.error("Error fetching order:", error)
        toast({
          title: "Error",
          description: "Failed to load order details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [params.id, toast])

  const handleStatusChange = async (status: string) => {
    if (!order) return

    setUpdating(true)
    try {
      const result = await updateOrderStatus(order.id, status)
      if (result.success) {
        setOrder({ ...order, status })
        toast({
          title: "Success",
          description: "Order status updated successfully.",
        })
      } else {
        throw new Error(result.error || "Failed to update order status")
      }
    } catch (error: any) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update order status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    )
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="mb-6 text-muted-foreground">The order you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/admin/orders">Back to Orders</Link>
          </Button>
        </div>
      </AdminLayout>
    )
  }

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild className="mr-2">
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            <TranslatedText textKey="admin.orderDetails" fallback="Order Details" />
          </h1>
          <span className="ml-2 text-sm text-muted-foreground">#{order.order_number}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <span className="mr-2">Status:</span>
            <Select value={order.status} onValueChange={handleStatusChange} disabled={updating}>
              <SelectTrigger className="w-[180px]">
                <SelectValue>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(option.value)}`}>
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {updating && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <TranslatedText textKey="admin.orderItems" fallback="Order Items" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                    <Image
                      src={order.product?.images?.[0] || "/placeholder.svg"}
                      alt={order.product?.name || "Product image"}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg"
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{order.product?.name}</h3>
                    {order.variation && (
                      <p className="text-sm text-muted-foreground">
                        {order.variation.color?.name} / {order.variation.size?.name}
                      </p>
                    )}
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-sm">
                        <TranslatedText textKey="admin.quantity" fallback="Quantity" />: {order.quantity}
                      </p>
                      <p className="font-medium">
                        ৳{((order.variation?.price || order.product?.price || 0) * order.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      <TranslatedText textKey="admin.subtotal" fallback="Subtotal" />
                    </span>
                    <span>৳{((order.variation?.price || order.product?.price || 0) * order.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      <TranslatedText textKey="admin.shipping" fallback="Shipping" />
                      {order.shipping_location && ` (${order.shipping_location})`}
                    </span>
                    <span>৳{order.shipping_cost?.toFixed(2) || "0.00"}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>
                      <TranslatedText textKey="admin.total" fallback="Total" />
                    </span>
                    <span>৳{order.total_amount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <TranslatedText textKey="admin.paymentInformation" fallback="Payment Information" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">
                    <TranslatedText textKey="admin.paymentMethod" fallback="Payment Method" />
                  </h3>
                  <p>{order.payment_method?.name}</p>
                </div>

                {order.payment_method?.type === "mobile_banking" && order.transaction_id && (
                  <div>
                    <h3 className="font-medium mb-1">
                      <TranslatedText textKey="admin.transactionId" fallback="Transaction ID" />
                    </h3>
                    <p className="font-mono">{order.transaction_id}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-medium mb-1">
                    <TranslatedText textKey="admin.paymentStatus" fallback="Payment Status" />
                  </h3>
                  <p>
                    {order.payment_method?.type === "cod"
                      ? "Cash on Delivery"
                      : order.status === "cancelled"
                        ? "Cancelled"
                        : "Paid"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <TranslatedText textKey="admin.customerInformation" fallback="Customer Information" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">
                    <TranslatedText textKey="admin.name" fallback="Name" />
                  </h3>
                  <p>{order.customer_name}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">
                    <TranslatedText textKey="admin.phone" fallback="Phone" />
                  </h3>
                  <p>{order.customer_phone}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">
                    <TranslatedText textKey="admin.address" fallback="Address" />
                  </h3>
                  <p className="whitespace-pre-wrap">{order.customer_address}</p>
                </div>

                {order.customer_note && (
                  <div>
                    <h3 className="font-medium mb-1">
                      <TranslatedText textKey="admin.note" fallback="Note" />
                    </h3>
                    <p className="whitespace-pre-wrap">{order.customer_note}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <TranslatedText textKey="admin.orderInformation" fallback="Order Information" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">
                    <TranslatedText textKey="admin.orderNumber" fallback="Order Number" />
                  </h3>
                  <p className="font-mono">{order.order_number}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">
                    <TranslatedText textKey="admin.orderDate" fallback="Order Date" />
                  </h3>
                  <p>{formatDate(order.created_at)}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">
                    <TranslatedText textKey="admin.lastUpdated" fallback="Last Updated" />
                  </h3>
                  <p>{formatDate(order.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
