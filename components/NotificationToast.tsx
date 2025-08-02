"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, Info } from "lucide-react"

interface NotificationToastProps {
  type: "success" | "error" | "info"
  title: string
  description: string
  show: boolean
  onClose: () => void
}

export default function NotificationToast({
  type,
  title,
  description,
  show,
  onClose,
}: NotificationToastProps) {
  const { toast } = useToast()

  useEffect(() => {
    if (show) {
      toast({
        title,
        description,
        variant: type === "error" ? "destructive" : "default",
      })
      onClose()
    }
  }, [show, title, description, type, toast, onClose])

  return null
} 