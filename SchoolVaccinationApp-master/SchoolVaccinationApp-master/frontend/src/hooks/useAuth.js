"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { toast } from "react-toastify"

// Create auth context
const AuthContext = createContext(null)

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  // Login function
  const login = async (username, password) => {
    try {
      setLoading(true)

      // For development/testing, allow hardcoded credentials
      if (
        process.env.NODE_ENV === "development" &&
        (username === "admin") &&
        password === "password123"
      ) {
        const userData = {
          id: username === "1",
          username,
          role: username,
          name: username === "Admin User",
        }

        // Store user in localStorage
        localStorage.setItem("user", JSON.stringify(userData))
        localStorage.setItem("token", "mock-token-for-development")
        setUser(userData)
        return userData
      }

      // In a real app, you would make an API call here
      // const response = await authService.login(username, password)
      // const userData = response.data.user
      // const token = response.data.token

      // For now, just simulate a successful login
      const userData = {
        id: "1",
        username: username,
        role: "admin",
        name: "Admin User",
      }

      const token = "mock-token-for-testing"

      // Store user and token in localStorage
      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("token", token)

      setUser(userData)
      return userData
    } catch (error) {
      console.error("Login error:", error)
      const errorMessage = error.response?.data?.message || "Invalid username or password"
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default useAuth
