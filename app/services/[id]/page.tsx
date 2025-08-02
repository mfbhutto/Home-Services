"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import axios from "axios"
import { useAuth } from "@/contexts/AuthContext"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, MapPin, Phone, Calendar, Shield } from "lucide-react"
import ReviewsList from "@/components/ReviewsList"

export default function ServiceDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bookingData, setBookingData] = useState({
    message: "",
    preferredDate: "",
  })
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingError, setBookingError] = useState("")

  useEffect(() => {
    fetchService()
  }, [params.id])

  const fetchService = async () => {
    try {
      const response = await axios.get(`/api/services/${params.id}`)
      setService(response.data.service)
    } catch (error) {
      console.error("Error fetching service:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async () => {
    if (!user) {
      window.location.href = "/auth/login"
      return
    }

    setBookingLoading(true)
    setBookingError("")

    try {
      await axios.post("/api/bookings", {
        serviceId: service._id,
        message: bookingData.message,
        preferredDate: bookingData.preferredDate,
      })

      setBookingSuccess(true)
      setBookingData({ message: "", preferredDate: "" })
    } catch (error: any) {
      setBookingError(error.response?.data?.message || "Failed to create booking")
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="w-full h-96 rounded-lg" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="w-full h-64 rounded-lg" />
              <Skeleton className="w-full h-48 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Service not found</h1>
            <p className="text-gray-600">The service you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Images */}
            <div className="relative">
              <Image
                src={service.images?.[0] || `/placeholder.svg?height=400&width=800&query=${service.category} service`}
                alt={service.title}
                width={800}
                height={400}
                className="w-full h-96 object-cover rounded-lg"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-blue-600 text-white text-sm">{service.category}</Badge>
              </div>
              {service.provider?.isVerified && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-100 text-green-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              )}
            </div>

            {/* Service Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.title}</h1>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-medium">{service.rating || 0}</span>
                        <span>({service.reviewCount || 0} reviews)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{service.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      PKR {service.price}
                      <span className="text-lg text-gray-500">/{service.priceType}</span>
                    </div>
                    <Badge
                      variant={service.availability === "available" ? "default" : "secondary"}
                      className={service.availability === "available" ? "bg-green-100 text-green-800" : ""}
                    >
                      {service.availability}
                    </Badge>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{service.description}</p>
                </div>

                {service.tags && service.tags.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {service.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Provider Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={service.provider?.avatar || "/placeholder.svg"} alt={service.provider?.name} />
                    <AvatarFallback>{service.provider?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>Service Provider</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{service.provider?.name}</h3>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>
                        {service.provider?.rating || 0} from {service.provider?.reviewCount || 0} review{service.provider?.reviewCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  {service.provider?.isVerified && (
                    <Badge className="bg-green-100 text-green-800">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                {service.provider?.bio && <p className="text-gray-700 text-sm">{service.provider.bio}</p>}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{service.provider?.location}</span>
                  </div>
                  {service.provider?.phone && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{service.provider.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Booking Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Book This Service</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bookingSuccess ? (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">
                      Booking request sent successfully! The provider will contact you soon.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    {bookingError && (
                      <Alert variant="destructive">
                        <AlertDescription>{bookingError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="preferredDate">Preferred Date</Label>
                      <Input
                        id="preferredDate"
                        type="datetime-local"
                        value={bookingData.preferredDate}
                        onChange={(e) => setBookingData((prev) => ({ ...prev, preferredDate: e.target.value }))}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Describe your requirements..."
                        value={bookingData.message}
                        onChange={(e) => setBookingData((prev) => ({ ...prev, message: e.target.value }))}
                        rows={4}
                      />
                    </div>

                    <Button
                      onClick={handleBooking}
                      disabled={bookingLoading || !bookingData.message || !bookingData.preferredDate}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {bookingLoading ? "Sending Request..." : "Send Booking Request"}
                    </Button>

                    {!user && (
                      <p className="text-sm text-gray-600 text-center">
                        <a href="/auth/login" className="text-blue-600 hover:underline">
                          Sign in
                        </a>{" "}
                        to book this service
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Category</span>
                  <Badge variant="outline">{service.category}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Price Type</span>
                  <span className="font-medium capitalize">{service.priceType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Availability</span>
                  <Badge
                    variant={service.availability === "available" ? "default" : "secondary"}
                    className={service.availability === "available" ? "bg-green-100 text-green-800" : ""}
                  >
                    {service.availability}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium">{service.location}</span>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <ReviewsList 
              serviceId={service._id}
              serviceProviderId={service.provider._id}
              title="Customer Reviews"
              showAverage={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
