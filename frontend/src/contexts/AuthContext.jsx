import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Set up axios defaults
  axios.defaults.baseURL = 'http://localhost:8000'

  useEffect(() => {
    console.log('AuthContext: Initializing authentication...')
    const token = localStorage.getItem('access_token')
    console.log('AuthContext: Token found:', !!token)
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUserProfile()
    } else {
      console.log('AuthContext: No token found, setting loading to false')
      setLoading(false)
    }
  }, [])

  const fetchUserProfile = async () => {
    try {
      console.log('AuthContext: Fetching user profile...')
      const response = await axios.get('/api/auth/profile/')
      console.log('AuthContext: User profile fetched:', response.data)
      setUser(response.data)
    } catch (error) {
      console.error('AuthContext: Error fetching user profile:', error)
      // Only logout if it's an authentication error, not a network error
      if (error.response?.status === 401) {
        logout()
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      console.log('AuthContext: Attempting login...')
      const response = await axios.post('/api/auth/login/', credentials)
      const { access, user: userData } = response.data
      
      console.log('AuthContext: Login successful, user:', userData)
      localStorage.setItem('access_token', access)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`
      setUser(userData)
      
      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      console.error('AuthContext: Login failed:', error)
      const message = error.response?.data?.username?.[0] || 
                     error.response?.data?.password?.[0] || 
                     'Login failed. Please try again.'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      console.log('AuthContext: Attempting registration...')
      const response = await axios.post('/api/auth/signup/', userData)
      const { access, user: newUser } = response.data
      
      console.log('AuthContext: Registration successful, user:', newUser)
      localStorage.setItem('access_token', access)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`
      setUser(newUser)
      
      toast.success('Registration successful!')
      return { success: true }
    } catch (error) {
      console.error('AuthContext: Registration failed:', error)
      const message = error.response?.data?.username?.[0] || 
                     error.response?.data?.email?.[0] || 
                     error.response?.data?.password?.[0] || 
                     'Registration failed. Please try again.'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    console.log('AuthContext: Logging out...')
    localStorage.removeItem('access_token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/auth/profile/', profileData)
      setUser(response.data)
      toast.success('Profile updated successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Add a function to check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('access_token')
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated,
  }

  console.log('AuthContext: Current user state:', user)

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
