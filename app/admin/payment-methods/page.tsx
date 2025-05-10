"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Pencil, Trash2, CreditCard, Banknote, Smartphone } from "lucide-react"
import {
  getAllPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from "@/lib/services/order-service"
import type { PaymentMethod } from "@/lib/types/order"

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "cod",
    instructions: "",
    active: true,
    accountNumber: "",
    accountType: "personal",
  })

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    setLoading(true)
    try {
      const methods = await getAllPaymentMethods()
      setPaymentMethods(methods)
    } catch (error) {
      console.error("Error fetching payment methods:", error)
      toast({
        title: "Error",
        description: "Failed to fetch payment methods. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "cod",
      instructions: "",
      active: true,
      accountNumber: "",
      accountType: "personal",
    })
  }

  const handleInputChange = (key: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleAddMethod = async () => {
    setSubmitting(true)
    try {
      const details =
        formData.type === "mobile_banking"
          ? { account_number: formData.accountNumber, account_type: formData.accountType }
          : {}

      const newMethod: Partial<PaymentMethod> = {
        name: formData.name,
        type: formData.type as "cod" | "mobile_banking",
        instructions: formData.instructions,
        active: formData.active,
        details,
        display_order: paymentMethods.length + 1,
      }

      const result = await createPaymentMethod(newMethod)

      if (!result.success) {
        throw new Error(result.error || "Failed to create payment method")
      }

      toast({
        title: "Success",
        description: "Payment method created successfully.",
      })

      // Refresh the list
      await fetchPaymentMethods()
      setShowAddDialog(false)
      resetForm()
    } catch (error) {
      console.error("Error creating payment method:", error)
      toast({
        title: "Error",
        description: "Failed to create payment method. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditMethod = (method: PaymentMethod) => {
    setSelectedMethod(method)
    setFormData({
      name: method.name,
      type: method.type,
      instructions: method.instructions,
      active: method.active,
      accountNumber: method.details.account_number || "",
      accountType: method.details.account_type || "personal",
    })
    setShowEditDialog(true)
  }

  const handleUpdateMethod = async () => {
    if (!selectedMethod) return

    setSubmitting(true)
    try {
      const details =
        formData.type === "mobile_banking"
          ? { account_number: formData.accountNumber, account_type: formData.accountType }
          : {}

      const updatedMethod: Partial<PaymentMethod> = {
        name: formData.name,
        type: formData.type as "cod" | "mobile_banking",
        instructions: formData.instructions,
        active: formData.active,
        details,
      }

      const result = await updatePaymentMethod(selectedMethod.id, updatedMethod)

      if (!result.success) {
        throw new Error(result.error || "Failed to update payment method")
      }

      toast({
        title: "Success",
        description: "Payment method updated successfully.",
      })

      // Refresh the list
      await fetchPaymentMethods()
      setShowEditDialog(false)
      setSelectedMethod(null)
      resetForm()
    } catch (error) {
      console.error("Error updating payment method:", error)
      toast({
        title: "Error",
        description: "Failed to update payment method. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteMethod = (method: PaymentMethod) => {
    setSelectedMethod(method)
    setShowDeleteDialog(true)
  }

  const confirmDeleteMethod = async () => {
    if (!selectedMethod) return

    setSubmitting(true)
    try {
      const result = await deletePaymentMethod(selectedMethod.id)

      if (!result.success) {
        throw new Error(result.error || "Failed to delete payment method")
      }

      toast({
        title: "Success",
        description: "Payment method deleted successfully.",
      })

      // Refresh the list
      await fetchPaymentMethods()
      setShowDeleteDialog(false)
      setSelectedMethod(null)
    } catch (error) {
      console.error("Error deleting payment method:", error)
      toast({
        title: "Error",
        description: "Failed to delete payment method. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getMethodTypeIcon = (type: string) => {
    switch (type) {
      case "cod":
        return <Banknote className="h-4 w-4 text-green-500" />
      case "mobile_banking":
        return <Smartphone className="h-4 w-4 text-blue-500" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Payment Methods</h1>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogDescription>
                Create a new payment method for your customers to use during checkout.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Method Name*</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Cash on Delivery, Bkash, Nagad"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Method Type*</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select method type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                    <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type === "mobile_banking" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="accountNumber">Account Number*</Label>
                    <Input
                      id="accountNumber"
                      value={formData.accountNumber}
                      onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                      placeholder="e.g., +8801XXXXXXXXX"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="accountType">Account Type</Label>
                    <Select
                      value={formData.accountType}
                      onValueChange={(value) => handleInputChange("accountType", value)}
                    >
                      <SelectTrigger id="accountType">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="merchant">Merchant</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="grid gap-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => handleInputChange("instructions", e.target.value)}
                  placeholder="Instructions for the customer"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  For mobile banking, include the account number and any specific instructions.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => handleInputChange("active", checked)}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMethod} disabled={submitting || !formData.name}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Method
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Payment Methods</CardTitle>
          <CardDescription>Configure the payment methods available to your customers during checkout.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No payment methods found.</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Payment Method
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentMethods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell className="font-medium">{method.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getMethodTypeIcon(method.type)}
                        <span>{method.type === "cod" ? "Cash on Delivery" : "Mobile Banking"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {method.type === "mobile_banking" && (
                        <div className="text-sm">
                          <div>{method.details.account_number}</div>
                          <div className="text-xs text-muted-foreground">{method.details.account_type} account</div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {method.active ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditMethod(method)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteMethod(method)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
            <DialogDescription>Update the details of this payment method.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Method Name*</Label>
              <Input id="edit-name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Method Type*</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Select method type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cod">Cash on Delivery</SelectItem>
                  <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === "mobile_banking" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="edit-accountNumber">Account Number*</Label>
                  <Input
                    id="edit-accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-accountType">Account Type</Label>
                  <Select
                    value={formData.accountType}
                    onValueChange={(value) => handleInputChange("accountType", value)}
                  >
                    <SelectTrigger id="edit-accountType">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="merchant">Merchant</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="grid gap-2">
              <Label htmlFor="edit-instructions">Instructions</Label>
              <Textarea
                id="edit-instructions"
                value={formData.instructions}
                onChange={(e) => handleInputChange("instructions", e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={formData.active}
                onCheckedChange={(checked) => handleInputChange("active", checked)}
              />
              <Label htmlFor="edit-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateMethod} disabled={submitting || !formData.name}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the payment method "{selectedMethod?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMethod}
              className="bg-red-500 hover:bg-red-600"
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
