"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save, RefreshCw } from "lucide-react"
import { getShippingCosts, updateShippingCost, type ShippingCost } from "@/lib/services/shipping-service"
import { TranslatedText } from "@/components/translated-text"

export default function ShippingPage() {
  const [shippingCosts, setShippingCosts] = useState<ShippingCost[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchShippingCosts()
  }, [])

  const fetchShippingCosts = async () => {
    try {
      setLoading(true)
      setError(null)
      const costs = await getShippingCosts()
      setShippingCosts(costs)
    } catch (error: any) {
      console.error("Error fetching shipping costs:", error)
      setError("Failed to load shipping costs. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load shipping costs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCostChange = (id: number, value: string) => {
    const numValue = Number.parseFloat(value)
    if (isNaN(numValue) || numValue < 0) return

    setShippingCosts((prev) => prev.map((cost) => (cost.id === id ? { ...cost, cost: numValue } : cost)))
  }

  const handleSave = async (id: number, cost: number) => {
    setSaving(id)
    try {
      const result = await updateShippingCost(id, cost)
      if (result.success) {
        toast({
          title: "Success",
          description: "Shipping cost updated successfully.",
        })
      } else {
        throw new Error(result.error || "Failed to update shipping cost")
      }
    } catch (error: any) {
      console.error("Error updating shipping cost:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update shipping cost. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(null)
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          <TranslatedText textKey="admin.shipping" fallback="Shipping Costs" />
        </h1>
        {error && (
          <Button variant="outline" onClick={fetchShippingCosts} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Retry
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-center text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchShippingCosts}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {shippingCosts.map((cost) => (
            <Card key={cost.id}>
              <CardHeader>
                <CardTitle>{cost.location_name}</CardTitle>
                <CardDescription>
                  <TranslatedText
                    textKey={`admin.shipping.${cost.location_key}.description`}
                    fallback={`Set shipping cost for ${cost.location_name}`}
                  />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  <div className="flex-1">
                    <Label htmlFor={`cost-${cost.id}`}>
                      <TranslatedText textKey="admin.shipping.cost" fallback="Cost (৳)" />
                    </Label>
                    <div className="flex items-center">
                      <span className="mr-2 text-lg">৳</span>
                      <Input
                        id={`cost-${cost.id}`}
                        type="number"
                        min="0"
                        step="1"
                        value={cost.cost}
                        onChange={(e) => handleCostChange(cost.id, e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSave(cost.id, cost.cost)}
                    disabled={saving === cost.id}
                    className="flex items-center gap-2 mt-2 sm:mt-0"
                  >
                    {saving === cost.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <TranslatedText textKey="admin.save" fallback="Save" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
