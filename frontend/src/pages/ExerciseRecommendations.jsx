import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Filter, 
  Search, 
  Dumbbell, 
  Clock, 
  Flame,
  Target,
  Users,
  Star,
  Heart,
  TrendingUp,
  Zap,
  Shield,
  Activity
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const ExerciseRecommendations = () => {
  const [recommendations, setRecommendations] = useState([])
  const [categories, setCategories] = useState({})
  const [filteredExercises, setFilteredExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState({
    age: 25,
    weight: 70,
    height: 170,
    gender: 'male',
    experience_level: 'beginner'
  })
  const [filters, setFilters] = useState({
    type: '',
    body_part: '',
    equipment: '',
    level: '',
    min_calories: '',
    max_duration: ''
  })

  useEffect(() => {
    fetchCategories()
    fetchRecommendations()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/ml/categories/')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      const response = await axios.post('/api/ml/recommendations/', {
        ...userProfile,
        num_recommendations: 10
      })
      setRecommendations(response.data.recommendations)
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      toast.error('Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  const fetchFilteredExercises = async () => {
    try {
      const response = await axios.post('/api/ml/filter/', filters)
      setFilteredExercises(response.data.exercises)
    } catch (error) {
      console.error('Error fetching filtered exercises:', error)
      toast.error('Failed to filter exercises')
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const applyFilters = () => {
    fetchFilteredExercises()
  }

  const clearFilters = () => {
    setFilters({
      type: '',
      body_part: '',
      equipment: '',
      level: '',
      min_calories: '',
      max_duration: ''
    })
    setFilteredExercises([])
  }

  const handleProfileChange = (key, value) => {
    setUserProfile(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const updateRecommendations = () => {
    fetchRecommendations()
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800'
      case 'challenging':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getBodyPartColor = (bodyPart) => {
    const colors = {
      'Chest': 'bg-red-100 text-red-800',
      'Biceps': 'bg-blue-100 text-blue-800',
      'Triceps': 'bg-purple-100 text-purple-800',
      'Shoulders': 'bg-indigo-100 text-indigo-800',
      'Abdominals': 'bg-green-100 text-green-800',
      'Quadriceps': 'bg-orange-100 text-orange-800',
      'Hamstrings': 'bg-pink-100 text-pink-800',
      'Glutes': 'bg-teal-100 text-teal-800',
      'Calves': 'bg-cyan-100 text-cyan-800',
      'Lats': 'bg-amber-100 text-amber-800',
      'Lower Back': 'bg-emerald-100 text-emerald-800',
      'Middle Back': 'bg-lime-100 text-lime-800'
    }
    return colors[bodyPart] || 'bg-gray-100 text-gray-800'
  }

  const renderRecommendationCard = (exercise, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card-hover bg-white rounded-xl shadow-lg border border-gray-100 p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{exercise.name}</h3>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(exercise.difficulty)}`}>
                  {exercise.difficulty || 'Moderate'}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBodyPartColor(exercise.body_part)}`}>
                  {exercise.body_part}
                </span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {exercise.type}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-xs text-gray-500">Calories</p>
                <p className="text-sm font-semibold text-gray-900">{exercise.calories_burned}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p className="text-sm font-semibold text-gray-900">{exercise.duration}m</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-xs text-gray-500">Rating</p>
                <p className="text-sm font-semibold text-gray-900">{exercise.rating}/10</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-xs text-gray-500">Match</p>
                <p className="text-sm font-semibold text-gray-900">{Math.round(exercise.similarity_score * 100)}%</p>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-700 leading-relaxed">{exercise.description}</p>
          </div>

          {/* Target Muscles */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-purple-500" />
              <h4 className="text-sm font-semibold text-gray-900">Target Muscles</h4>
            </div>
            <p className="text-sm text-gray-600">{exercise.target_muscles}</p>
          </div>

          {/* Benefits */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <h4 className="text-sm font-semibold text-gray-900">Benefits</h4>
            </div>
            <p className="text-sm text-gray-600">{exercise.benefits}</p>
          </div>
          
          {/* Why Recommended */}
          {exercise.recommended_for && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Heart className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-semibold text-blue-900">Why Recommended</h4>
              </div>
              <p className="text-sm text-blue-800">{exercise.recommended_for}</p>
            </div>
          )}
          
          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-orange-500" />
              <h4 className="text-sm font-semibold text-gray-900">Instructions</h4>
            </div>
            <p className="text-sm text-gray-700">{exercise.instructions}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading personalized recommendations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Exercise Recommendations</h1>
            <p className="text-gray-600 mt-1">
              Personalized workout suggestions based on your profile
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Profile */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card bg-white rounded-xl shadow-lg border border-gray-100 p-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Your Profile</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  value={userProfile.age}
                  onChange={(e) => handleProfileChange('age', parseInt(e.target.value))}
                  className="input-field"
                  min="13"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={userProfile.weight}
                  onChange={(e) => handleProfileChange('weight', parseInt(e.target.value))}
                  className="input-field"
                  min="30"
                  max="200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={userProfile.height}
                  onChange={(e) => handleProfileChange('height', parseInt(e.target.value))}
                  className="input-field"
                  min="100"
                  max="250"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={userProfile.gender}
                  onChange={(e) => handleProfileChange('gender', e.target.value)}
                  className="input-field"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                <select
                  value={userProfile.experience_level}
                  onChange={(e) => handleProfileChange('experience_level', e.target.value)}
                  className="input-field"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <button
                onClick={updateRecommendations}
                className="w-full btn-primary flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
              >
                <Brain className="w-4 h-4" />
                Update Recommendations
              </button>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card bg-white rounded-xl shadow-lg border border-gray-100 p-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="input-field"
                >
                  <option value="">All Types</option>
                  {categories.types?.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body Part</label>
                <select
                  value={filters.body_part}
                  onChange={(e) => handleFilterChange('body_part', e.target.value)}
                  className="input-field"
                >
                  <option value="">All Body Parts</option>
                  {categories.body_parts?.map(part => (
                    <option key={part} value={part}>{part}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
                <select
                  value={filters.equipment}
                  onChange={(e) => handleFilterChange('equipment', e.target.value)}
                  className="input-field"
                >
                  <option value="">All Equipment</option>
                  {categories.equipment?.map(equipment => (
                    <option key={equipment} value={equipment}>{equipment}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className="input-field"
                >
                  <option value="">All Levels</option>
                  {categories.levels?.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={applyFilters}
                  className="btn-primary flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  Apply
                </button>
                <button
                  onClick={clearFilters}
                  className="btn-secondary flex-1"
                >
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* AI Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Personalized Recommendations</h2>
                  <p className="text-gray-600">Based on your profile: {userProfile.age} years, {userProfile.gender}, {userProfile.experience_level} level</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Found</p>
                <p className="text-2xl font-bold text-primary-600">{recommendations.length}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {recommendations.map((exercise, index) => renderRecommendationCard(exercise, index))}
            </div>
          </motion.div>

          {/* Filtered Results */}
          {filteredExercises.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <Search className="w-6 h-6 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">Filtered Results</h2>
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">({filteredExercises.length} exercises)</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredExercises.map((exercise, index) => (
                  <div key={index} className="card-hover bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{exercise.name}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBodyPartColor(exercise.body_part)}`}>
                            {exercise.body_part}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {exercise.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg mx-auto mb-1">
                          <Flame className="w-4 h-4 text-red-600" />
                        </div>
                        <p className="text-xs text-gray-600">Calories</p>
                        <p className="text-sm font-semibold text-gray-900">{exercise.calories_burned}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-1">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-xs text-gray-600">Duration</p>
                        <p className="text-sm font-semibold text-gray-900">{exercise.duration}m</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mx-auto mb-1">
                          <Target className="w-4 h-4 text-purple-600" />
                        </div>
                        <p className="text-xs text-gray-600">Level</p>
                        <p className="text-sm font-semibold text-gray-900 capitalize">{exercise.level}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-700">{exercise.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Equipment: {exercise.equipment}</span>
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExerciseRecommendations
