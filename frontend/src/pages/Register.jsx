import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { Eye, EyeOff, UserPlus } from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    role: 'member',
    phone: '',
    // Gym details for admin users
    gym_name: '',
    gym_address: '',
    gym_phone: '',
    gym_email: '',
    gym_description: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { register, loading: authLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated()) {
      console.log('Register: User already authenticated, redirecting to dashboard')
      navigate('/dashboard')
    }
  }, [authLoading, isAuthenticated, navigate])

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Don't show register page if user is authenticated
  if (isAuthenticated()) {
    return null
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.password_confirm) {
      alert('Passwords do not match')
      return
    }
    
    // Validate gym details for admin users
    if (formData.role === 'admin') {
      if (!formData.gym_name || !formData.gym_address || !formData.gym_phone || !formData.gym_email) {
        alert('Please fill in all gym details for gym owner registration')
        return
      }
    }
    
    setLoading(true)
    const result = await register(formData)
    if (result.success) {
      navigate('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="First name"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field mt-1"
              >
                <option value="member">Member</option>
                <option value="admin">Gym Owner</option>
              </select>
            </div>

            {/* Gym Details - Only show for admin role */}
            {formData.role === 'admin' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 border-t pt-4"
              >
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900">Gym Details</h3>
                  <p className="text-sm text-gray-600">Please provide your gym information</p>
                </div>

                <div>
                  <label htmlFor="gym_name" className="block text-sm font-medium text-gray-700">
                    Gym Name *
                  </label>
                  <input
                    id="gym_name"
                    name="gym_name"
                    type="text"
                    required={formData.role === 'admin'}
                    value={formData.gym_name}
                    onChange={handleChange}
                    className="input-field mt-1"
                    placeholder="Enter your gym name"
                  />
                </div>

                <div>
                  <label htmlFor="gym_address" className="block text-sm font-medium text-gray-700">
                    Gym Address *
                  </label>
                  <textarea
                    id="gym_address"
                    name="gym_address"
                    required={formData.role === 'admin'}
                    value={formData.gym_address}
                    onChange={handleChange}
                    rows={3}
                    className="input-field mt-1"
                    placeholder="Enter complete gym address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="gym_phone" className="block text-sm font-medium text-gray-700">
                      Gym Phone *
                    </label>
                    <input
                      id="gym_phone"
                      name="gym_phone"
                      type="tel"
                      required={formData.role === 'admin'}
                      value={formData.gym_phone}
                      onChange={handleChange}
                      className="input-field mt-1"
                      placeholder="Gym phone number"
                    />
                  </div>
                  <div>
                    <label htmlFor="gym_email" className="block text-sm font-medium text-gray-700">
                      Gym Email *
                    </label>
                    <input
                      id="gym_email"
                      name="gym_email"
                      type="email"
                      required={formData.role === 'admin'}
                      value={formData.gym_email}
                      onChange={handleChange}
                      className="input-field mt-1"
                      placeholder="Gym email address"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="gym_description" className="block text-sm font-medium text-gray-700">
                    Gym Description
                  </label>
                  <textarea
                    id="gym_description"
                    name="gym_description"
                    value={formData.gym_description}
                    onChange={handleChange}
                    rows={3}
                    className="input-field mt-1"
                    placeholder="Brief description of your gym (optional)"
                  />
                </div>
              </motion.div>
            )}
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-10"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password_confirm"
                  name="password_confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.password_confirm}
                  onChange={handleChange}
                  className="input-field pr-10"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default Register
