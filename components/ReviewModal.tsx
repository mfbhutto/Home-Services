"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ReviewForm from "./ReviewForm"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
  serviceTitle: string
  onReviewSubmitted: () => void
}

export default function ReviewModal({ 
  isOpen, 
  onClose, 
  bookingId, 
  serviceTitle, 
  onReviewSubmitted 
}: ReviewModalProps) {
  const handleReviewSubmitted = () => {
    onReviewSubmitted()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
        </DialogHeader>
        <ReviewForm
          bookingId={bookingId}
          serviceTitle={serviceTitle}
          onReviewSubmitted={handleReviewSubmitted}
        />
      </DialogContent>
    </Dialog>
  )
} 