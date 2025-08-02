"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Navbar from "@/components/Navbar"
import {
  Search,
  Star,
  MapPin,
  Phone,
  Mail,
  Zap,
  Wrench,
  Car,
  Hammer,
  Users,
  Sparkles,
  Leaf,
  Paintbrush,
  Home,
  SprayCan,
  Brush,
} from "lucide-react"
import Lottie from "lottie-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"

const categories = [
  { name: "Electrician", icon: Zap, color: "bg-yellow-100 text-yellow-600", count: "120+ Services" },
  { name: "Plumber", icon: Wrench, color: "bg-blue-100 text-blue-600", count: "95+ Services" },
  { name: "Mechanic", icon: Car, color: "bg-red-100 text-red-600", count: "80+ Services" },
  { name: "Renovator", icon: Hammer, color: "bg-orange-100 text-orange-600", count: "65+ Services" },
  { name: "Labor", icon: Users, color: "bg-purple-100 text-purple-600", count: "150+ Services" },
  { name: "Cleaning", icon: Sparkles, color: "bg-green-100 text-green-600", count: "110+ Services" },
  { name: "Gardening", icon: Leaf, color: "bg-emerald-100 text-emerald-600", count: "75+ Services" },
  { name: "Painting", icon: Paintbrush, color: "bg-pink-100 text-pink-600", count: "55+ Services" },
  { name: "Fumigation", icon: SprayCan, color: "bg-gray-100 text-gray-600", count: "30+ Services" },
  { name: "Janitorial Services", icon: Brush, color: "bg-indigo-100 text-indigo-600", count: "40+ Services" },
]

const categoriesList = [
  "Electrician",
  "Plumber",
  "Mechanic",
  "Renovator",
  "Labor",
  "Cleaning",
  "Gardening",
  "Painting",
]

function AnimatedCategories() {
  const [index, setIndex] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    if (isTyping) {
      const currentWord = categoriesList[index]
      if (displayText.length < currentWord.length) {
        const timeout = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length + 1))
        }, 100) // Speed of typing
        return () => clearTimeout(timeout)
      } else {
        // Word is fully typed, wait then start deleting
        const timeout = setTimeout(() => {
          setIsTyping(false)
        }, 1000) // Wait 1 second after typing
        return () => clearTimeout(timeout)
      }
    } else {
      // Deleting phase
      if (displayText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1))
        }, 50) // Speed of deleting
        return () => clearTimeout(timeout)
      } else {
        // Word is fully deleted, move to next word
        const timeout = setTimeout(() => {
          setIndex((prev) => (prev + 1) % categoriesList.length)
          setIsTyping(true)
        }, 200) // Brief pause before next word
        return () => clearTimeout(timeout)
      }
    }
  }, [displayText, isTyping, index])

  return (
    <span style={{ display: "inline-block", minWidth: 120, position: "relative", top: "-0px" }}>
      <motion.span
        key={`${categoriesList[index]}-${isTyping}`}
        initial={{ x: isTyping ? -20 : 0 }}
        animate={{ x: 0 }}
        exit={{ x: 20 }}
        transition={{ duration: 0.3 }}
        style={{ display: "inline-block" }}
      >
        {displayText}
        {isTyping && <span className="animate-pulse">|</span>}
      </motion.span>
    </span>
  )
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [featuredServices, setFeaturedServices] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchFeaturedServices()
  }, [])

  const fetchFeaturedServices = async () => {
    try {
      const response = await axios.get('/api/services?limit=6')
      setFeaturedServices(response.data.services)
    } catch (error) {
      console.error('Error fetching featured services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.set("search", searchQuery)
    if (location) params.set("location", location)

    window.location.href = `/services?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Find Trusted
                  <span className="block text-yellow-400">
                    <AnimatedCategories />
                  </span>
                  Near You Homes and Offices
                </h1>
                <p className="text-xl text-blue-100 max-w-lg">
                  Connect with verified local professionals for all your home service needs. From plumbing to electrical
                  work, we've got you covered.
                </p>
                
                {/* Sign Up Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <Link href="/auth/signup?role=client">
                    <Button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3 text-lg">
                      Sign Up as Client
                    </Button>
                  </Link>
                  <Link href="/auth/signup?role=provider">
                    <Button className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 font-semibold px-8 py-3 text-lg">
                      Sign Up as Service Provider
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Search Bar */}
              <div className="bg-white rounded-lg p-4 shadow-xl">
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="What service do you need?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-gray-200 text-gray-900"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Enter your location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10 border-gray-200 text-gray-900"
                    />
                  </div>
                  <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                    Search Services
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-8 text-blue-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-sm">Service Providers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">10k+</div>
                  <div className="text-sm">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">4.8</div>
                  <div className="text-sm">Average Rating</div>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Lottie Animation for Hero Section */}
              <LottieLoader />
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Popular Service Categories</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Browse through our most requested services and find the perfect professional for your needs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <Link key={category.name} href="/services" className="group">
                  <Card className="hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                    <CardContent className="p-6 text-center">
                      <div
                        className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <IconComponent className="w-8 h-8" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.count}</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get connected with trusted professionals in just a few simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Search Services</h3>
              <p className="text-gray-600">
                Browse through our categories or search for specific services you need in your area.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Choose Provider</h3>
              <p className="text-gray-600">
                Compare profiles, read reviews, and select the best professional for your needs.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Book & Connect</h3>
              <p className="text-gray-600">
                Send a booking request and get connected with your chosen service provider instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers who found their perfect service provider through HomeService
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Find Services
              </Button>
            </Link>
            <Link href="/auth/signup?role=provider">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                Become a Provider
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">HomeService</span>
              </div>
              <p className="text-gray-400">
                Connecting you with trusted local service providers for all your home needs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/services?category=Electrician" className="hover:text-white">
                    Electrician
                  </Link>
                </li>
                <li>
                  <Link href="/services?category=Plumber" className="hover:text-white">
                    Plumber
                  </Link>
                </li>
                <li>
                  <Link href="/services?category=Mechanic" className="hover:text-white">
                    Mechanic
                  </Link>
                </li>
                <li>
                  <Link href="/services?category=Renovator" className="hover:text-white">
                    Renovator
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>support@homeservice.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 HomeService. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function LottieLoader() {
  const [animationData, setAnimationData] = useState(null)
  useEffect(() => {
    fetch("/ServisHero%20Loading.json")
      .then((res) => res.json())
      .then(setAnimationData)
  }, [])
  if (!animationData) {
    return <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] max-w-full" />
  }
  return (
    <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] max-w-full flex items-center justify-center">
      <Lottie
        animationData={animationData}
        loop={true}
        className="w-full h-full object-contain"
      />
    </div>
  )
}
