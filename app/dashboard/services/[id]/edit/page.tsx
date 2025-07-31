"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import axios from "axios"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Upload, X, Plus, Save, Trash2 } from "lucide-react"
import Link from "next/link"

const categories = [
  { value: "Electrician", label: "Electrician" },
  { value: "Plumber", label: "Plumber" },
  { value: "Mechanic", label: "Mechanic" },
  { value: "Renovator", label: "Renovator" },
  { value: "Labor", label: "Labor" },
  { value: "Cleaning", label: "Cleaning" },
  { value: "Gardening", label: "Gardening" },
  { value: "Painting", label: "Painting" },
]

const priceTypes = [
  { value: "hourly", label: "Per Hour" },
  { value: "fixed", label: "Fixed Price" },
  { value: "daily", label: "Per Day" },
]

export default function EditServicePage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    priceType: "hourly",
    location: "",
    tags: [] as string[],
    images: [] as string[],
  })
  const [newTag, setNewTag] = useState("")
  const [uploadingImages, setUploadingImages] = useState(false)

  // Debug logging
  console.log("EditServicePage - Service ID:", params.id)
  console.log("EditServicePage - User:", user)

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "provider") {
    router.push("/auth/login")
    return null
  }

  useEffect(() => {
    if (params.id) {
      fetchService()
    }
  }, [params.id])

  const fetchService = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`/api/services/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const service = response.data.service
      console.log("Fetched service:", service)

      // Check if the service belongs to the current user
      const isOwner =
        (typeof service.provider === "object" && service.provider._id === user._id) ||
        (typeof service.provider === "string" && service.provider === user._id)
      if (!isOwner) {
        toast({
          title: "Error",
          description: "You can only edit your own services.",
          variant: "destructive",
        })
        router.push("/dashboard")
        return
      }

      setFormData({
        title: service.title,
        description: service.description,
        category: service.category,
        price: service.price.toString(),
        priceType: service.priceType,
        location: service.location,
        tags: service.tags || [],
        images: service.images || [],
      })
    } catch (error: any) {
      console.error("Error fetching service:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch service.",
        variant: "destructive",
      })
      router.push("/dashboard")
    } finally {
      setFetching(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImages(true)

    try {
      const uploadedUrls: string[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "Error",
            description: `File ${file.name} is too large. Maximum size is 5MB.`,
            variant: "destructive",
          })
          continue
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Error",
            description: `File ${file.name} is not an image.`,
            variant: "destructive",
          })
          continue
        }

        // Create data URL for the image
        const reader = new FileReader()
        
        const imageUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            resolve(reader.result as string)
          }
          reader.onerror = () => {
            reject(new Error('Failed to read file'))
          }
          reader.readAsDataURL(file)
        })

        uploadedUrls.push(imageUrl)
      }

      if (uploadedUrls.length > 0) {
        setFormData(prev => ({ 
          ...prev, 
          images: [...prev.images, ...uploadedUrls]
        }))

        toast({
          title: "Success!",
          description: `${uploadedUrls.length} image(s) uploaded successfully.`,
        })
      }
    } catch (error) {
      console.error("Image upload error:", error)
      toast({
        title: "Error",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingImages(false)
    }
  }

  const handleRemoveImage = (imageUrl: string) => {
    setFormData(prev => ({ 
      ...prev, 
      images: prev.images.filter(img => img !== imageUrl)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "Error",
          description: "Please log in to edit a service.",
          variant: "destructive",
        })
        return
      }

      const response = await axios.put(`/api/services/${params.id}`, {
        ...formData,
        price: parseFloat(formData.price),
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      toast({
        title: "Success!",
        description: "Service updated successfully.",
      })

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Service update error:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update service.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      await axios.delete(`/api/services/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      toast({
        title: "Success!",
        description: "Service deleted successfully.",
      })

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Service deletion error:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete service.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading service...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Service</h1>
              <p className="text-gray-600 mt-2">Update your service information</p>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Service
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Service Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Emergency Plumbing Services"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your service in detail..."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Los Angeles, CA"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="priceType">Price Type *</Label>
                      <Select value={formData.priceType} onValueChange={(value) => handleInputChange("priceType", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priceTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                  <p className="text-sm text-gray-600">Add relevant tags to help clients find your service</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Service Images</CardTitle>
                  <p className="text-sm text-gray-600">Upload images of your work or service</p>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      {uploadingImages ? "Uploading..." : "Click to upload images"}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Supported formats: JPG, PNG, GIF. Max size: 5MB per image.
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={uploadingImages}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      disabled={uploadingImages}
                      onClick={() => document.getElementById("image-upload")?.click()}
                    >
                      {uploadingImages ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        "Choose Files"
                      )}
                    </Button>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Uploaded Images ({formData.images.length}):</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Service image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                              onError={(e) => {
                                console.error("Image failed to load:", image)
                                e.currentTarget.src = "/placeholder-image.jpg"
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(image)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                              title="Remove image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Preview */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.title && (
                    <div>
                      <h3 className="font-semibold text-lg">{formData.title}</h3>
                      {formData.category && (
                        <Badge className="mt-2">{formData.category}</Badge>
                      )}
                    </div>
                  )}

                  {formData.description && (
                    <p className="text-gray-600 text-sm">{formData.description}</p>
                  )}

                  {formData.price && (
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">
                        ${formData.price}
                      </span>
                      <span className="text-sm text-gray-500">/{formData.priceType}</span>
                    </div>
                  )}

                  {formData.location && (
                    <div className="flex items-center text-sm text-gray-500">
                      <span>📍 {formData.location}</span>
                    </div>
                  )}

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 border-t space-y-2">
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Updating..." : "Update Service"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push("/dashboard")}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 