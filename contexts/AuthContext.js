"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("AuthContext: useEffect triggered")
    const token = localStorage.getItem("token")
    console.log("AuthContext: Token from localStorage:", token ? "Found" : "Not found")
    
    if (token) {
      console.log("AuthContext: Setting axios default header")
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      fetchUser()
    } else {
      console.log("AuthContext: No token found, setting loading to false")
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    console.log("AuthContext: fetchUser called")
    try {
      console.log("AuthContext: Making request to /api/auth/me")
      const response = await axios.get("/api/auth/me")
      console.log("AuthContext: User fetched successfully:", response.data.user)
      setUser(response.data.user)
    } catch (error) {
      console.error("AuthContext: fetchUser error:", error.response?.data)
      console.error("AuthContext: Removing token due to error")
      localStorage.removeItem("token")
      delete axios.defaults.headers.common["Authorization"]
    } finally {
      console.log("AuthContext: Setting loading to false")
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password })
      const { token, user } = response.data

      localStorage.setItem("token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(user)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      }
    }
  }

  const signup = async (userData) => {
    try {
      const response = await axios.post("/api/auth/signup", userData)
      const { token, user } = response.data

      localStorage.setItem("token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(user)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Signup failed",
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
  }

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
