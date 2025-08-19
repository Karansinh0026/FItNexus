import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import GymManagement from './pages/GymManagement'
import MyGym from './pages/MyGym'
import ExerciseRecommendations from './pages/ExerciseRecommendations'
import ExerciseTracking from './pages/ExerciseTracking'
import GymEnrollment from './pages/GymEnrollment'
import Profile from './pages/Profile'

const PrivateRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth()
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  // Check if user is authenticated
  return isAuthenticated() ? children : <Navigate to="/login" />
}

const AppRoutes = () => {
  const { loading } = useAuth()
  
  // Show loading spinner while initializing
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/gym-management" 
        element={
          <PrivateRoute>
            <GymManagement />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/my-gym" 
        element={
          <PrivateRoute>
            <MyGym />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/gym-enrollment" 
        element={
          <PrivateRoute>
            <GymEnrollment />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/recommendations" 
        element={
          <PrivateRoute>
            <ExerciseRecommendations />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/exercise-tracking" 
        element={
          <PrivateRoute>
            <ExerciseTracking />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } 
      />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-16">
          <AppRoutes />
        </main>
      </div>
    </AuthProvider>
  )
}

export default App
