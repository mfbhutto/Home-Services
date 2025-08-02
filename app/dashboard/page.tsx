"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BookingResponseModal from "@/components/BookingResponseModal"
import CompleteBookingModal from "@/components/CompleteBookingModal"
import ReviewModal from "@/components/ReviewModal"
import {
  Briefcase,
  Calendar,
  Star,
  MapPin,
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Bell,
  MessageCircle,
} from "lucide-react"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [services, setServices] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalServices: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
  })
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
      return
    }

    if (user) {
      // Ensure axios headers are set
      const token = localStorage.getItem("token")
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
        console.log("Dashboard: Set axios Authorization header")
      }
      fetchDashboardData()
      fetchNotifications()
    }
  }, [user, authLoading])

  const fetchDashboardData = async () => {
    try {
      console.log("Fetching dashboard data for user:", user?.name, "Role:", user?.role)
      
      // Get token for authenticated request
      const token = localStorage.getItem("token")
      console.log("Token exists:", !!token)
      
      // Set axios default headers for this session
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
        console.log("Set axios default Authorization header")
      }
      
      // Fetch services separately to debug
      let servicesRes
      if (user?.role === "provider") {
        try {
          console.log("Making services API call with provider=me")
          console.log("User ID:", user._id)
          console.log("Authorization header:", `Bearer ${token?.substring(0, 20)}...`)
          
          servicesRes = await axios.get("/api/services?provider=me")
          console.log("Services API Response:", servicesRes.data)
          console.log("Services API Status:", servicesRes.status)
          console.log("Number of services returned:", servicesRes.data.services?.length || 0)
          
          // Check if services belong to current user
          if (servicesRes.data.services) {
            servicesRes.data.services.forEach((service, index) => {
              console.log(`Service ${index + 1}:`, {
                title: service.title,
                provider: service.provider,
                currentUserId: user._id,
                isMyService: service.provider === user._id
              })
            })
          }
        } catch (servicesError) {
          console.error("Services API Error:", servicesError.response?.data)
          console.error("Services API Status:", servicesError.response?.status)
          servicesRes = { data: { services: [] } }
        }
      } else {
        servicesRes = { data: { services: [] } }
      }

      // Fetch bookings separately to handle errors
      let bookingsRes
      try {
        bookingsRes = await axios.get("/api/bookings")
        console.log("Bookings API Response:", bookingsRes.data)
      } catch (bookingsError) {
        console.error("Bookings API Error:", bookingsError.response?.data)
        console.error("Bookings API Status:", bookingsError.response?.status)
        bookingsRes = { data: { bookings: [] } }
      }

      if (user?.role === "provider") {
        const services = servicesRes.data.services || []
        console.log("Setting services:", services.length, "services")
        console.log("Services data:", services)
        setServices(services)
      }
      setBookings(bookingsRes.data.bookings || [])

      // Calculate stats
      const totalServices = servicesRes.data.services?.length || 0
      const totalBookings = bookingsRes.data.bookings?.length || 0
      const pendingBookings = bookingsRes.data.bookings?.filter((b: any) => b.status === "pending").length || 0
      const completedBookings = bookingsRes.data.bookings?.filter((b: any) => b.status === "completed").length || 0

      console.log("Stats:", { totalServices, totalBookings, pendingBookings, completedBookings })

      setStats({
        totalServices,
        totalBookings,
        pendingBookings,
        completedBookings,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      console.error("Error details:", error.response?.data)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true)
      const response = await axios.get("/api/notifications")
      setNotifications(response.data.notifications || [])
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setNotificationsLoading(false)
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await axios.put("/api/notifications", { notificationIds: [notificationId] })
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "cancelled":
        return <XCircle className="w-4 h-4 text-gray-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      await axios.delete(`/api/services/${serviceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      // Remove the service from the local state
      setServices(prevServices => prevServices.filter(service => service._id !== serviceId))
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        totalServices: prevStats.totalServices - 1
      }))

      alert("Service deleted successfully!")
    } catch (error: any) {
      console.error("Service deletion error:", error)
      alert(error.response?.data?.message || "Failed to delete service.")
    }
  }

  const handleRespondToBooking = (booking: any) => {
    setSelectedBooking(booking)
    setIsResponseModalOpen(true)
  }

  const handleBookingResponseSuccess = () => {
    // Refresh the dashboard data
    fetchDashboardData()
    fetchNotifications()
  }

  const handleCompleteBooking = (booking: any) => {
    setSelectedBooking(booking)
    setIsCompleteModalOpen(true)
  }

  const handleBookingCompletionSuccess = () => {
    // Refresh the dashboard data
    fetchDashboardData()
    fetchNotifications()
  }

  const handleLeaveReview = (booking: any) => {
    setSelectedBookingForReview(booking)
    setIsReviewModalOpen(true)
  }

  const handleReviewSubmitted = () => {
    fetchDashboardData()
    setIsReviewModalOpen(false)
    setSelectedBookingForReview(null)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.name}! Here's what's happening with your account.
              </p>
            </div>
            {user?.role === "provider" && (
              <Link href="/dashboard/services/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {user?.role === "provider" && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Services</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalServices}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingBookings}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.completedBookings}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            {user?.role === "provider" && <TabsTrigger value="services">My Services</TabsTrigger>}
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking: any) => (
                      <div key={booking._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-lg">{booking.service?.title}</h3>
                              <Badge className={getStatusColor(booking.status)}>
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(booking.status)}
                                  <span className="capitalize">{booking.status}</span>
                                </div>
                              </Badge>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <p>
                                  <strong>Client:</strong> {booking.client?.name}
                                </p>
                                <p>
                                  <strong>Provider:</strong> {booking.provider?.name}
                                </p>
                              </div>
                              <div>
                                <p>
                                  <strong>Date:</strong> {new Date(booking.preferredDate).toLocaleDateString()}
                                </p>
                                <p>
                                  <strong>Category:</strong> {booking.service?.category}
                                </p>
                              </div>
                            </div>

                            {booking.message && (
                              <div className="mt-3 p-3 bg-gray-100 rounded-md">
                                <p className="text-sm">
                                  <strong>Message:</strong> {booking.message}
                                </p>
                              </div>
                            )}

                                                         {/* Show response information for confirmed/rejected bookings */}
                             {(booking.status === "confirmed" || booking.status === "rejected") && (
                               <div className="mt-3 p-3 bg-blue-50 rounded-md">
                                 <div className="grid md:grid-cols-2 gap-4 text-sm">
                                   <div>
                                     <p><strong>Final Amount:</strong> ${booking.finalAmount}</p>
                                     <p><strong>Payment Method:</strong> {booking.paymentMethod === "cash" ? "Cash on Delivery" : "Card Payment"}</p>
                                   </div>
                                   {booking.serviceProviderNote && (
                                     <div>
                                       <p><strong>Provider Note:</strong> {booking.serviceProviderNote}</p>
                                     </div>
                                   )}
                                 </div>
                               </div>
                             )}

                             {/* Show completion information for completed bookings */}
                             {booking.status === "completed" && (
                               <div className="mt-3 p-3 bg-green-50 rounded-md">
                                 <div className="grid md:grid-cols-2 gap-4 text-sm">
                                   <div>
                                     <p><strong>Final Amount:</strong> ${booking.finalAmount}</p>
                                     <p><strong>Payment Method:</strong> {booking.paymentMethod === "cash" ? "Cash on Delivery" : "Card Payment"}</p>
                                     <p><strong>Completed On:</strong> {new Date(booking.updatedAt).toLocaleDateString()}</p>
                                   </div>
                                   {booking.completionNote && (
                                     <div>
                                       <p><strong>Completion Note:</strong> {booking.completionNote}</p>
                                     </div>
                                   )}
                                 </div>
                               </div>
                             )}
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">${booking.service?.price}</p>
                            <p className="text-sm text-gray-500">{booking.service?.priceType}</p>
                            
                                                         {/* Respond button for pending bookings (providers only) */}
                             {user?.role === "provider" && 
                              booking.status === "pending" && 
                              booking.provider?._id === user._id && (
                               <div className="mt-3">
                                 <Button
                                   size="sm"
                                   onClick={() => handleRespondToBooking(booking)}
                                   className="bg-blue-600 hover:bg-blue-700"
                                 >
                                   <MessageSquare className="w-4 h-4 mr-2" />
                                   Respond
                                 </Button>
                               </div>
                             )}

                             {/* Complete button for confirmed bookings (providers only) */}
                             {user?.role === "provider" && 
                              booking.status === "confirmed" && 
                              booking.provider?._id === user._id && (
                               <div className="mt-3">
                                 <Button
                                   size="sm"
                                   onClick={() => handleCompleteBooking(booking)}
                                   className="bg-green-600 hover:bg-green-700"
                                 >
                                   <CheckCircle className="w-4 h-4 mr-2" />
                                   Complete
                                 </Button>
                               </div>
                             )}

                             {/* Leave Review button for completed bookings (clients only) */}
                             {user?.role === "client" && 
                              booking.status === "completed" && 
                              booking.client?._id === user._id && 
                              !booking.reviewed && (
                               <div className="mt-3">
                                 <Button
                                   size="sm"
                                   onClick={() => handleLeaveReview(booking)}
                                   className="bg-purple-600 hover:bg-purple-700"
                                 >
                                   <MessageCircle className="w-4 h-4 mr-2" />
                                   Leave Review
                                 </Button>
                               </div>
                             )}

                             {/* Review submitted indicator for completed bookings */}
                             {user?.role === "client" && 
                              booking.status === "completed" && 
                              booking.client?._id === user._id && 
                              booking.reviewed && (
                               <div className="mt-3">
                                 <Badge variant="secondary" className="bg-green-100 text-green-800">
                                   <CheckCircle className="w-3 h-3 mr-1" />
                                   Review Submitted
                                 </Badge>
                               </div>
                             )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-600">
                      {user?.role === "provider"
                        ? "When clients book your services, they will appear here."
                        : "Start browsing services to make your first booking."}
                    </p>
                    {user?.role === "client" && (
                      <Link href="/services" className="mt-4 inline-block">
                        <Button>Browse Services</Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab (Provider only) */}
          {user?.role === "provider" && (
            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>My Services</CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={fetchDashboardData}
                        disabled={loading}
                      >
                        {loading ? "Refreshing..." : "Refresh"}
                      </Button>
                    <Link href="/dashboard/services/new">
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Service
                      </Button>
                    </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {console.log("Rendering services section. Services count:", services.length)}
                  {console.log("Services data:", services)}
                  {services.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {services.map((service: any) => (
                        <Card key={service._id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <Badge className="bg-blue-100 text-blue-800">{service.category}</Badge>
                              <Badge
                                variant={service.availability === "available" ? "default" : "secondary"}
                                className={service.availability === "available" ? "bg-green-100 text-green-800" : ""}
                              >
                                {service.availability}
                              </Badge>
                            </div>

                            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{service.title}</h3>

                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p>

                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-medium">
                                  {service.rating || 0} from {service.reviewCount || 0} review{service.reviewCount !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <div className="flex items-center text-gray-500 text-sm">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span className="truncate">{service.location}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xl font-bold text-blue-600">${service.price}</span>
                                <span className="text-sm text-gray-500">/{service.priceType}</span>
                              </div>
                              <div className="flex space-x-2">
                                <Link href={`/services/${service._id}`}>
                                  <Button size="sm" variant="outline">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Link href={`/dashboard/services/${service._id}/edit`}>
                                  <Button size="sm" variant="outline">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteService(service._id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
                      <p className="text-gray-600 mb-4">
                        Create your first service to start receiving bookings from clients.
                      </p>
                      <Link href="/dashboard/services/new">
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Service
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                {notificationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notification: any) => (
                      <div 
                        key={notification._id} 
                        className={`border rounded-lg p-4 transition-colors ${
                          !notification.isRead ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Bell className="w-4 h-4 text-blue-600" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-gray-900">
                                {notification.title}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </span>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            
                            {notification.booking && (
                              <div className="mt-2 text-xs text-gray-500">
                                <p>Service: {notification.booking.service?.title}</p>
                                <p>Status: {notification.booking.status}</p>
                              </div>
                            )}
                            
                            {!notification.isRead && (
                              <div className="mt-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => markNotificationAsRead(notification._id)}
                                  className="text-xs"
                                >
                                  Mark as read
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
                    <p className="text-gray-600">
                      You'll receive notifications here when there are updates to your bookings.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                    <AvatarFallback className="text-2xl">{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Name</label>
                        <p className="text-lg font-semibold">{user?.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <p className="text-lg">{user?.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Role</label>
                        <Badge className="capitalize">{user?.role}</Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Phone</label>
                        <p className="text-lg">{user?.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Location</label>
                        <p className="text-lg">{user?.location || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Rating</label>
                        <div className="flex items-center space-x-1">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                          <span className="text-lg font-semibold">{user?.rating || 0}</span>
                          <span className="text-gray-500">({user?.reviewCount || 0} reviews)</span>
                        </div>
                      </div>
                    </div>

                    {user?.bio && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Bio</label>
                        <p className="text-gray-700 mt-1">{user.bio}</p>
                      </div>
                    )}

                    <div className="pt-4">
                      <Link href="/dashboard/profile/edit">
                        <Button>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

             {/* Booking Response Modal */}
       <BookingResponseModal
         isOpen={isResponseModalOpen}
         onClose={() => setIsResponseModalOpen(false)}
         booking={selectedBooking}
         onSuccess={handleBookingResponseSuccess}
       />

       {/* Complete Booking Modal */}
       <CompleteBookingModal
         isOpen={isCompleteModalOpen}
         onClose={() => setIsCompleteModalOpen(false)}
         booking={selectedBooking}
         onSuccess={handleBookingCompletionSuccess}
       />

       {/* Review Modal */}
       <ReviewModal
         isOpen={isReviewModalOpen}
         onClose={() => setIsReviewModalOpen(false)}
         bookingId={selectedBookingForReview?._id}
         serviceTitle={selectedBookingForReview?.service?.title}
         onReviewSubmitted={handleReviewSubmitted}
       />
     </div>
   )
 }
