"use client"

import { useState, useEffect } from "react"
import { Star, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import axios from "axios"

interface Review {
  _id: string
  rating: number
  comment: string
  createdAt: string
  clientId: {
    name: string
    avatar?: string
  }
  serviceId: {
    title: string
  }
}

interface ReviewsListProps {
  serviceProviderId?: string
  serviceId?: string
  title?: string
  showAverage?: boolean
}

export default function ReviewsList({ 
  serviceProviderId, 
  serviceId, 
  title = "Reviews",
  showAverage = true 
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)

  useEffect(() => {
    fetchReviews()
  }, [serviceProviderId, serviceId])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (serviceProviderId) params.set("serviceProviderId", serviceProviderId)
      if (serviceId) params.set("serviceId", serviceId)
      params.set("limit", "10")

      const response = await axios.get(`/api/reviews?${params.toString()}`)
      setReviews(response.data.reviews)

      // Calculate average rating
      if (response.data.reviews.length > 0) {
        const total = response.data.reviews.reduce((sum: number, review: Review) => sum + review.rating, 0)
        setAverageRating(Math.round((total / response.data.reviews.length) * 10) / 10)
        setTotalReviews(response.data.reviews.length)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "Poor"
      case 2: return "Fair"
      case 3: return "Good"
      case 4: return "Very Good"
      case 5: return "Excellent"
      default: return ""
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {showAverage && totalReviews > 0 && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-medium">{averageRating}</span>
              </div>
              <span className="text-sm text-gray-500">
                from {totalReviews} review{totalReviews !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={review.clientId.avatar} />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{review.clientId.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= review.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {getRatingText(review.rating)}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No reviews yet</p>
            <p className="text-sm text-gray-400">Be the first to leave a review!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 