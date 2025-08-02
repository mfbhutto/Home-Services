// This script seeds the database with sample data
// Run this after setting up your MongoDB connection

const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI 

// Sample data
const sampleUsers = [
  {
    name: "John Smith",
    email: "john.electrician@example.com",
    password: "password123",
    role: "provider",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    bio: "Licensed electrician with 10+ years of experience. Specializing in residential and commercial electrical work.",
    rating: 4.9,
    reviewCount: 127,
    isVerified: true,
  },
  {
    name: "Sarah Johnson",
    email: "sarah.plumber@example.com",
    password: "password123",
    role: "provider",
    phone: "+1 (555) 234-5678",
    location: "Los Angeles, CA",
    bio: "Professional plumber offering emergency and scheduled plumbing services.",
    rating: 4.8,
    reviewCount: 89,
    isVerified: true,
  },
  {
    name: "Mike Wilson",
    email: "mike.renovator@example.com",
    password: "password123",
    role: "provider",
    phone: "+1 (555) 345-6789",
    location: "Chicago, IL",
    bio: "Home renovation specialist with expertise in kitchen and bathroom remodeling.",
    rating: 4.9,
    reviewCount: 156,
    isVerified: true,
  },
  {
    name: "Emily Davis",
    email: "emily.client@example.com",
    password: "password123",
    role: "client",
    phone: "+1 (555) 456-7890",
    location: "Miami, FL",
  },
]

const sampleServices = [
  {
    title: "Professional Electrical Installation & Repair",
    description:
      "Complete electrical services including wiring, outlet installation, circuit breaker repair, and electrical troubleshooting. Licensed and insured with 24/7 emergency service available.",
    category: "Electrician",
    price: 45,
    priceType: "hourly",
    location: "New York, NY",
    images: ["/37811.jpg"],
    availability: "available",
    rating: 4.9,
    reviewCount: 127,
    tags: ["electrical", "wiring", "installation", "repair", "emergency"],
  },
  {
    title: "Emergency Plumbing Services - 24/7 Available",
    description:
      "Fast and reliable plumbing services including leak repairs, drain cleaning, pipe installation, and emergency plumbing. Fully licensed and equipped with modern tools.",
    category: "Plumber",
    price: 60,
    priceType: "hourly",
    location: "Los Angeles, CA",
    images: ["/40766.jpg"],
    availability: "available",
    rating: 4.8,
    reviewCount: 89,
    tags: ["plumbing", "emergency", "leak repair", "drain cleaning"],
  },
  {
    title: "Complete Home Renovation & Remodeling",
    description:
      "Transform your home with our comprehensive renovation services. Kitchen remodeling, bathroom upgrades, flooring installation, and custom carpentry work.",
    category: "Renovator",
    price: 80,
    priceType: "hourly",
    location: "Chicago, IL",
    images: [],
    availability: "available",
    rating: 4.9,
    reviewCount: 156,
    tags: ["renovation", "remodeling", "kitchen", "bathroom", "flooring"],
  },
  {
    title: "Auto Mechanic - Car Repair & Maintenance",
    description:
      "Professional automotive repair services including engine diagnostics, brake repair, oil changes, and general maintenance. ASE certified technician.",
    category: "Mechanic",
    price: 55,
    priceType: "hourly",
    location: "Houston, TX",
    images: [],
    availability: "available",
    rating: 4.7,
    reviewCount: 92,
    tags: ["auto repair", "maintenance", "diagnostics", "brakes"],
  },
  {
    title: "HomeMaid & Moving Services",
    description:
      "Reliable home services for moving, furniture assembly, yard work, and general handyman tasks. Experienced team with competitive rates.",
    category: "HomeMaid",
    price: 25,
    priceType: "hourly",
    location: "Phoenix, AZ",
    images: [],
    availability: "available",
    rating: 4.6,
    reviewCount: 73,
    tags: ["homemaid", "moving", "assembly", "handyman"],
  },
  {
    title: "Professional Janitorial Services",
    description:
      "Thorough residential cleaning services including deep cleaning, regular maintenance, and move-in/move-out cleaning. Eco-friendly products available.",
    category: "Janitorial Services",
    price: 35,
    priceType: "hourly",
    location: "Seattle, WA",
    images: [],
    availability: "available",
    rating: 4.8,
    reviewCount: 134,
    tags: ["janitorial", "deep clean", "eco-friendly", "residential"],
  },
]

const sampleCategories = [
  {
    name: "Electrician",
    description: "Professional electrical services and repairs",
    icon: "zap",
    color: "#F59E0B",
  },
  {
    name: "Plumber",
    description: "Plumbing installation, repair, and maintenance",
    icon: "wrench",
    color: "#3B82F6",
  },
  {
    name: "Mechanic",
    description: "Automotive repair and maintenance services",
    icon: "car",
    color: "#EF4444",
  },
  {
    name: "Renovator",
    description: "Home renovation and remodeling services",
    icon: "hammer",
    color: "#F97316",
  },
  {
    name: "HomeMaid",
    description: "General home services and handyman tasks",
    icon: "users",
    color: "#8B5CF6",
  },
  {
    name: "Janitorial Services",
    description: "Professional janitorial and cleaning services",
    icon: "sparkles",
    color: "#10B981",
  },
  {
    name: "Gardening",
    description: "Landscaping and garden maintenance",
    icon: "leaf",
    color: "#059669",
  },
  {
    name: "Painting",
    description: "Interior and exterior painting services",
    icon: "paintbrush",
    color: "#EC4899",
  },
]

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")

    // Clear existing data
    await mongoose.connection.db.dropDatabase()
    console.log("Database cleared")

    // Create User model
    const userSchema = new mongoose.Schema(
      {
        name: String,
        email: { type: String, unique: true },
        password: String,
        role: { type: String, enum: ["client", "provider"], default: "client" },
        phone: String,
        location: String,
        avatar: { type: String, default: "/placeholder-user.jpg" },
        bio: String,
        rating: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 },
        isVerified: { type: Boolean, default: false },
      },
      { timestamps: true },
    )

    userSchema.pre("save", async function (next) {
      if (!this.isModified("password")) return next()
      this.password = await bcrypt.hash(this.password, 12)
      next()
    })

    const User = mongoose.model("User", userSchema)

    // Create Service model
    const serviceSchema = new mongoose.Schema(
      {
        title: String,
        description: String,
        category: String,
        provider: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        price: Number,
        priceType: { type: String, enum: ["hourly", "fixed", "daily"], default: "hourly" },
        location: String,
        images: [String],
        availability: { type: String, enum: ["available", "busy", "unavailable"], default: "available" },
        rating: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 },
        tags: [String],
        isActive: { type: Boolean, default: true },
      },
      { timestamps: true },
    )

    const Service = mongoose.model("Service", serviceSchema)

    // Create Category model
    const categorySchema = new mongoose.Schema(
      {
        name: { type: String, unique: true },
        description: String,
        icon: String,
        color: { type: String, default: "#3B82F6" },
        isActive: { type: Boolean, default: true },
      },
      { timestamps: true },
    )

    const Category = mongoose.model("Category", categorySchema)

    // Seed users
    console.log("Seeding users...")
    const createdUsers = await User.insertMany(sampleUsers)
    console.log(`Created ${createdUsers.length} users`)

    // Seed categories
    console.log("Seeding categories...")
    const createdCategories = await Category.insertMany(sampleCategories)
    console.log(`Created ${createdCategories.length} categories`)

    // Seed services (assign to providers)
    console.log("Seeding services...")
    const providers = createdUsers.filter((user) => user.role === "provider")

    const servicesWithProviders = sampleServices.map((service, index) => ({
      ...service,
      provider: providers[index % providers.length]._id,
    }))

    const createdServices = await Service.insertMany(servicesWithProviders)
    console.log(`Created ${createdServices.length} services`)

    console.log("Database seeded successfully!")
    console.log("\nSample login credentials:")
    console.log("Provider: john.electrician@example.com / password123")
    console.log("Provider: sarah.plumber@example.com / password123")
    console.log("Provider: mike.renovator@example.com / password123")
    console.log("Client: emily.client@example.com / password123")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await mongoose.connection.close()
    console.log("Database connection closed")
  }
}

// Run the seed function
seedDatabase()
