"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import axios from "axios"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, MapPin, Star, Filter, Zap, Wrench, Car, Hammer, Users, Sparkles, Leaf, Paintbrush, SprayCan, Brush } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

const categories = [
  { name: "Electrician", label: "Electrician", icon: Zap },
  { name: "Plumber", label: "Plumber", icon: Wrench },
  { name: "Mechanic", label: "Mechanic", icon: Car },
  { name: "Renovator", label: "Renovator", icon: Hammer },
  { name: "Labor", label: "Labor", icon: Users },
  { name: "Cleaning", label: "Cleaning", icon: Sparkles },
  { name: "Gardening", label: "Gardening", icon: Leaf },
  { name: "Painting", label: "Painting", icon: Paintbrush },
  { name: "Fumigation", label: "Fumigation", icon: SprayCan },
  { name: "Janitorial Services", label: "Janitorial Services", icon: Brush },
]

export default function ServicesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    location: "",
    sortBy: "newest",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  })

  // Sync filters with searchParams whenever the URL changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
      location: searchParams.get("location") || "",
    }))
    setPagination((prev) => ({ ...prev, page: 1 }))
    // eslint-disable-next-line
  }, [searchParams])

  useEffect(() => {
    if (filters.category) {
      fetchServices()
    }
    // eslint-disable-next-line
  }, [filters, pagination.page])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.search) params.set("search", filters.search)
      if (filters.category) params.set("category", filters.category)
      if (filters.location) params.set("location", filters.location)
      params.set("page", pagination.page.toString())
      params.set("limit", pagination.limit.toString())

      const response = await axios.get(`/api/services?${params.toString()}`)
      setServices(response.data.services)
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages,
      }))
    } catch (error) {
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleSearch = () => {
    fetchServices()
  }

  const ServiceSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="w-full h-48" />
      <CardContent className="p-6">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-3" />
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardContent>
    </Card>
  )

  // Only show categories if no category is selected
  if (!filters.category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Services</h1>
            <p className="text-gray-600">Browse categories and request providers as needed</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <Card key={category.name} className="overflow-visible">
                  <CardContent className="p-6 flex flex-col items-center justify-center">
                    <div className="mb-4 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                        {IconComponent && <IconComponent className="w-8 h-8 text-blue-600 mx-auto" />}
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 text-center">{category.label}</h2>
                    </div>
                    <Button
                      className="mb-2 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        if (!user) {
                          toast({
                            title: "Login Required",
                            description: "Please log in to request providers.",
                            variant: "destructive",
                          })
                        } else {
                          router.push(`/services?category=${category.name}`)
                        }
                      }}
                    >
                      Request Providers
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // If a category is selected, show the full search/filter/provider grid UI
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find {filters.category} Providers</h1>
          <p className="text-gray-600">Search, filter, and request providers for {filters.category}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search services..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.name} value={category.name}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Location..."
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
              <Filter className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
        <div className="mb-6">
          <p className="text-gray-600">{loading ? "Loading..." : `${pagination.total} services found`}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => <ServiceSkeleton key={index} />)
          ) : services.length > 0 ? (
            services.map((service: any) => (
              <Link key={service._id} href={`/services/${service._id}`} className="group">
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                  <div className="relative">
                    <Image
                      src={service.images?.[0] || `/placeholder.svg?height=200&width=300&query=${service.category} service`}
                      alt={service.title}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-blue-600 text-white">{service.category}</Badge>
                    </div>
                    {service.provider?.isVerified && (
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Verified
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {service.title}
                    </h3>
                    <div className="flex items-center space-x-2 mb-3">
                      <Image
                        src={service.provider?.avatar || "/placeholder-user.jpg"}
                        alt={service.provider?.name}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-gray-600">{service.provider?.name}</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium text-sm">{service.rating || 0}</span>
                        <span className="text-gray-500 text-sm">({service.reviewCount || 0})</span>
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
                      <Badge
                        variant={service.availability === "available" ? "default" : "secondary"}
                        className={service.availability === "available" ? "bg-green-100 text-green-800" : ""}
                      >
                        {service.availability}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or browse all categories.</p>
            </div>
          )}
        </div>
        {pagination.pages > 1 && (
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              disabled={pagination.page === 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const page = i + 1
              return (
                <Button
                  key={page}
                  variant={pagination.page === page ? "default" : "outline"}
                  onClick={() => setPagination((prev) => ({ ...prev, page }))}
                >
                  {page}
                </Button>
              )
            })}
            <Button
              variant="outline"
              disabled={pagination.page === pagination.pages}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

