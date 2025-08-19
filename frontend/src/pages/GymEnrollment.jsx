import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Building,
  CheckCircle,
  ArrowLeft,
  Search
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const GymEnrollment = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [gyms, setGyms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchCity, setSearchCity] = useState('')
  const [enrolling, setEnrolling] = useState(false)
  const [selectedGym, setSelectedGym] = useState(null)
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    // Check if user is already enrolled
    checkEnrollmentStatus()
    // Load all gyms by default
    loadAllGyms()
  }, [])

  const checkEnrollmentStatus = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats/')
      if (response.data && response.data.gym_info) {
        toast.error('You are already enrolled in a gym!')
        navigate('/dashboard')
      }
    } catch (error) {
      // If error, user is not enrolled, which is fine
      console.log('User not enrolled yet')
    }
  }

  const loadAllGyms = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/gyms/available/')
      setGyms(response.data)
    } catch (error) {
      console.error('Error loading gyms:', error)
      toast.error('Failed to load gyms. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const searchGyms = async () => {
    if (!searchCity.trim()) {
      toast.error('Please enter a city name')
      return
    }

    setLoading(true)
    try {
      const response = await axios.get(`/api/gyms/available/?city=${encodeURIComponent(searchCity.trim())}`)
      setGyms(response.data)
      
      if (response.data.length === 0) {
        toast.info('No gyms found in this city. Try searching for a different city.')
      }
    } catch (error) {
      console.error('Error searching gyms:', error)
      toast.error('Failed to search gyms. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const enrollInGym = async (gym) => {
    setEnrolling(true)
    try {
      const response = await axios.post('/api/gyms/enroll/', {
        gym_id: gym.id
      })
      
      toast.success(response.data.message)
      setSelectedGym(gym)
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (error) {
      console.error('Error enrolling in gym:', error)
      if (error.response?.status === 400) {
        toast.error(error.response.data.error)
      } else {
        toast.error('Failed to enroll in gym. Please try again.')
      }
    } finally {
      setEnrolling(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    searchGyms()
  }

  const clearSearch = () => {
    setSearchCity('')
    setShowSearch(false)
    loadAllGyms()
  }

  if (selectedGym) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Enrollment Successful!</h1>
            <p className="text-gray-600">You have been successfully enrolled in</p>
            <p className="text-xl font-semibold text-primary-600">{selectedGym.name}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <div className="flex items-center mb-4">
              <Building className="w-8 h-8 text-primary-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">{selectedGym.name}</h3>
                <p className="text-sm text-gray-600">{selectedGym.address}</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                {selectedGym.phone}
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                {selectedGym.email}
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Redirecting to dashboard...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Find Your Gym</h1>
            <p className="text-gray-600 mt-2">Browse available gyms and enroll in one</p>
          </div>
        </div>
      </motion.div>

      {/* Search Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="btn-secondary flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {showSearch ? 'Hide Search' : 'Search by City'}
            </button>
            {showSearch && (
              <button
                onClick={clearSearch}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Show All Gyms
              </button>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {gyms.length} gym{gyms.length !== 1 ? 's' : ''} available
          </div>
        </div>
      </motion.div>

      {/* Search Section */}
      {showSearch && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search by City
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    placeholder="Enter city name (e.g., New York, London, Mumbai)"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                  <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading || !searchCity.trim()}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gyms...</p>
        </motion.div>
      )}

      {/* Results Section */}
      {!loading && gyms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {showSearch && searchCity && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Gyms in {searchCity}
              </h2>
              <p className="text-gray-600">Found {gyms.length} gym{gyms.length !== 1 ? 's' : ''}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gyms.map((gym, index) => (
              <motion.div
                key={gym.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <Building className="w-8 h-8 text-primary-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{gym.name}</h3>
                        <p className="text-sm text-gray-600">Owner: {gym.owner_name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {gym.address}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {gym.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {gym.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      {gym.member_count} member{gym.member_count !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {gym.description && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {gym.description}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => enrollInGym(gym)}
                    disabled={enrolling}
                    className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enrolling ? (
                      <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* No Results */}
      {!loading && gyms.length === 0 && searchCity && showSearch && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No gyms found</h3>
          <p className="text-gray-600 mb-4">
            No gyms were found in "{searchCity}". Try searching for a different city.
          </p>
          <button
            onClick={clearSearch}
            className="btn-secondary"
          >
            Show All Gyms
          </button>
        </motion.div>
      )}
    </div>
  )
}

export default GymEnrollment
