import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Calendar, 
  Clock, 
  Flame, 
  Dumbbell, 
  Target,
  Edit,
  Trash2,
  TrendingUp,
  Activity,
  BarChart3
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const ExerciseTracking = () => {
  const { user } = useAuth()
  const [exerciseEntries, setExerciseEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [formData, setFormData] = useState({
    exercise_name: '',
    exercise_type: '',
    body_part: '',
    duration: '',
    calories_burned: '',
    sets: '1',
    reps: '1',
    weight: '',
    notes: ''
  })

  const exerciseTypes = [
    'Cardio', 'Strength Training', 'Flexibility', 'Balance', 'Sports',
    'Yoga', 'Pilates', 'HIIT', 'CrossFit', 'Swimming', 'Running',
    'Cycling', 'Walking', 'Dancing', 'Other'
  ]

  const bodyParts = [
    'Full Body', 'Upper Body', 'Lower Body', 'Core', 'Arms',
    'Legs', 'Chest', 'Back', 'Shoulders', 'Abs', 'Glutes',
    'Cardiovascular', 'Other'
  ]

  useEffect(() => {
    fetchExerciseEntries()
  }, [])

  const fetchExerciseEntries = async () => {
    try {
      const response = await axios.get('/api/exercise-entries/')
      setExerciseEntries(response.data.results || response.data)
    } catch (error) {
      console.error('Error fetching exercise entries:', error)
      toast.error('Failed to load exercise history')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingEntry) {
        await axios.put(`/api/exercise-entries/${editingEntry.id}/`, formData)
        toast.success('Exercise updated successfully!')
        setEditingEntry(null)
      } else {
        await axios.post('/api/exercise-entries/', formData)
        toast.success('Exercise logged successfully!')
      }
      
      setShowAddForm(false)
      resetForm()
      fetchExerciseEntries()
    } catch (error) {
      console.error('Error saving exercise:', error)
      toast.error('Failed to save exercise')
    }
  }

  const handleEdit = (entry) => {
    setEditingEntry(entry)
    setFormData({
      exercise_name: entry.exercise_name,
      exercise_type: entry.exercise_type,
      body_part: entry.body_part,
      duration: entry.duration.toString(),
      calories_burned: entry.calories_burned.toString(),
      sets: entry.sets.toString(),
      reps: entry.reps.toString(),
      weight: entry.weight ? entry.weight.toString() : '',
      notes: entry.notes || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this exercise entry?')) {
      try {
        await axios.delete(`/api/exercise-entries/${entryId}/`)
        toast.success('Exercise entry deleted successfully!')
        fetchExerciseEntries()
      } catch (error) {
        console.error('Error deleting exercise:', error)
        toast.error('Failed to delete exercise entry')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      exercise_name: '',
      exercise_type: '',
      body_part: '',
      duration: '',
      calories_burned: '',
      sets: '1',
      reps: '1',
      weight: '',
      notes: ''
    })
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const calculateTotalCalories = () => {
    return exerciseEntries.reduce((total, entry) => total + entry.calories_burned, 0)
  }

  const getRecentEntries = () => {
    return exerciseEntries.slice(0, 5)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Exercise Tracking</h1>
            <p className="text-gray-600 mt-2">Track your workouts and monitor your progress</p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(true)
              setEditingEntry(null)
              resetForm()
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Log Exercise
          </button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Exercises</p>
              <p className="text-2xl font-bold text-gray-900">{exerciseEntries.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Calories</p>
              <p className="text-2xl font-bold text-gray-900">{calculateTotalCalories()}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {exerciseEntries.filter(entry => {
                  const entryDate = new Date(entry.date)
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return entryDate >= weekAgo
                }).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900">
                {exerciseEntries.length > 0 
                  ? Math.round(exerciseEntries.reduce((sum, entry) => sum + entry.duration, 0) / exerciseEntries.length)
                  : 0} min
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Exercise History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Exercise History</h2>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            
            {exerciseEntries.length > 0 ? (
              <div className="space-y-4">
                {exerciseEntries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Dumbbell className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{entry.exercise_name}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Target className="w-3 h-3 mr-1" />
                            {entry.body_part}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {entry.duration} min
                          </span>
                          <span className="flex items-center">
                            <Flame className="w-3 h-3 mr-1" />
                            {entry.calories_burned} cal
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleEdit(entry)}
                        className="text-primary-600 hover:text-primary-900 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No exercises logged yet</p>
                <p className="text-sm text-gray-500">Start tracking your workouts to see your progress!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Add Exercise Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingEntry ? 'Edit Exercise' : 'Log Exercise'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingEntry(null)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exercise Name
                  </label>
                  <input
                    type="text"
                    name="exercise_name"
                    required
                    value={formData.exercise_name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., Push-ups, Running, Squats"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exercise Type
                  </label>
                  <select
                    name="exercise_type"
                    required
                    value={formData.exercise_type}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select type</option>
                    {exerciseTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Body Part
                  </label>
                  <select
                    name="body_part"
                    required
                    value={formData.body_part}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select body part</option>
                    {bodyParts.map(part => (
                      <option key={part} value={part}>{part}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      required
                      min="1"
                      value={formData.duration}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Calories Burned
                    </label>
                    <input
                      type="number"
                      name="calories_burned"
                      required
                      min="1"
                      value={formData.calories_burned}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="150"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sets
                    </label>
                    <input
                      type="number"
                      name="sets"
                      min="1"
                      value={formData.sets}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reps
                    </label>
                    <input
                      type="number"
                      name="reps"
                      min="1"
                      value={formData.reps}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      min="0"
                      step="0.1"
                      value={formData.weight}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="input-field"
                    rows="3"
                    placeholder="How did it feel? Any modifications?"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {editingEntry ? 'Update Exercise' : 'Log Exercise'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingEntry(null)
                      resetForm()
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Recent Activity */}
        {!showAddForm && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                <TrendingUp className="w-5 h-5 text-primary-600" />
              </div>
              
              {getRecentEntries().length > 0 ? (
                <div className="space-y-3">
                  {getRecentEntries().map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{entry.exercise_name}</p>
                        <p className="text-xs text-gray-600">
                          {entry.calories_burned} cal • {entry.duration} min
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No recent activity</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ExerciseTracking
