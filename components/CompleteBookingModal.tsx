"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, MessageSquare } from "lucide-react"

interface CompleteBookingModalProps {
  isOpen: boolean
  onClose: () => void
  booking: any
  onSuccess: () => void
}

export default function CompleteBookingModal({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: CompleteBookingModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [completionNote, setCompletionNote] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "Error",
          description: "Please log in to complete bookings.",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`/api/bookings/${booking._id}/complete`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          completionNote,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to complete booking")
      }

      toast({
        title: "Success!",
        description: "Booking marked as completed successfully.",
      })

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("Booking completion error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to complete booking.",
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
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Complete Booking</span>
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
              <p><strong>Final Amount:</strong> ${booking.finalAmount}</p>
              <p><strong>Payment Method:</strong> {booking.paymentMethod === "cash" ? "Cash on Delivery" : "Card Payment"}</p>
            </div>
          </div>

          {/* Completion Note */}
          <div className="space-y-2">
            <Label htmlFor="completionNote">Completion Note (Optional)</Label>
            <Textarea
              id="completionNote"
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              placeholder="Add any notes about the completed service..."
              rows={3}
            />
            <p className="text-xs text-gray-500">
              This note will be visible to the client and can include details about the completed work.
            </p>
          </div>

          {/* Confirmation Message */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Important:</p>
                <p>Marking this booking as completed will:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Notify the client that their service has been completed</li>
                  <li>Update the booking status to "completed"</li>
                  <li>Allow the client to leave a review</li>
                </ul>
              </div>
            </div>
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
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                "Completing..."
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Completed
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 