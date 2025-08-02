"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, DollarSign, CreditCard, MessageSquare } from "lucide-react"

interface BookingResponseModalProps {
  isOpen: boolean
  onClose: () => void
  booking: any
  onSuccess: () => void
}

export default function BookingResponseModal({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: BookingResponseModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    status: "confirmed",
    finalAmount: "",
    paymentMethod: "cash",
    serviceProviderNote: "",
  })

  useEffect(() => {
    if (booking && isOpen) {
      // Pre-fill with service price as default final amount
      setFormData({
        status: "confirmed",
        finalAmount: booking.service?.price?.toString() || "",
        paymentMethod: "cash",
        serviceProviderNote: "",
      })
    }
  }, [booking, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "Error",
          description: "Please log in to respond to bookings.",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`/api/bookings/${booking._id}/respond`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          finalAmount: parseFloat(formData.finalAmount),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to respond to booking")
      }

      toast({
        title: "Success!",
        description: `Booking ${formData.status} successfully.`,
      })

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("Booking response error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to respond to booking.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  if (!booking) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span>Respond to Booking</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Booking Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Booking Details</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Service:</strong> {booking.service?.title}</p>
              <p><strong>Client:</strong> {booking.client?.name}</p>
              <p><strong>Date:</strong> {new Date(booking.preferredDate).toLocaleDateString()}</p>
              <p><strong>Original Price:</strong> ${booking.service?.price}/{booking.service?.priceType}</p>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">Response Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmed">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Confirm Booking</span>
                  </div>
                </SelectItem>
                <SelectItem value="rejected">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>Reject Booking</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Final Amount */}
          <div className="space-y-2">
            <Label htmlFor="finalAmount">Final Amount ($) *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="finalAmount"
                type="number"
                step="0.01"
                min="0"
                value={formData.finalAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, finalAmount: e.target.value }))}
                className="pl-10"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method *</Label>
            <RadioGroup
              value={formData.paymentMethod}
              onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex items-center space-x-2 cursor-pointer">
                  <DollarSign className="w-4 h-4" />
                  <span>Cash on Delivery</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center space-x-2 cursor-pointer">
                  <CreditCard className="w-4 h-4" />
                  <span>Card Payment</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Optional Note */}
          <div className="space-y-2">
            <Label htmlFor="serviceProviderNote">Optional Note to Client</Label>
            <Textarea
              id="serviceProviderNote"
              value={formData.serviceProviderNote}
              onChange={(e) => setFormData(prev => ({ ...prev, serviceProviderNote: e.target.value }))}
              placeholder="Add any additional information for the client..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <DialogFooter className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.finalAmount}
              className={
                formData.status === "confirmed"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {loading ? (
                "Submitting..."
              ) : formData.status === "confirmed" ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Booking
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Booking
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 