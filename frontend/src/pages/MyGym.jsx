import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  Building, 
  Users, 
  Flame, 
  Activity, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  Edit,
  Save,
  X,
  User,
  Award,
  TrendingUp,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const MyGym = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [gymData, setGymData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    description: ''
  })

  useEffect(() => {
    fetchGymData()
  }, [])

  const fetchGymData = async () => {
    try {
      const response = await axios.get('/api/gyms/my-gym/')
      setGymData(response.data)
      setEditForm({
        name: response.data.name,
        address: response.data.address,
        phone: response.data.phone,
        email: response.data.email,
        description: response.data.description || ''
      })
    } catch (error) {
      console.error('Error fetching gym data:', error)
      if (error.response?.status === 404) {
        toast.error('No gym found for your account.')
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Only gym owners can view this page.')
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.')
      } else {
        toast.error('Failed to load gym data. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditing(true)
  }

  const handleCancel = () => {
    setEditing(false)
    setEditForm({
      name: gymData.name,
      address: gymData.address,
      phone: gymData.phone,
      email: gymData.email,
      description: gymData.description || ''
    })
  }

  const handleSave = async () => {
    try {
      const response = await axios.put(`/api/gyms/${gymData.id}/`, editForm)
      setGymData(response.data)
      setEditing(false)
      toast.success('Gym information updated successfully!')
    } catch (error) {
      console.error('Error updating gym:', error)
      toast.error('Failed to update gym information')
    }
  }

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    })
  }

  const handleDeleteGym = async () => {
    try {
      const response = await axios.delete('/api/gyms/my-gym/')
      
      // Check if account was deleted
      if (response.data.account_deleted) {
        toast.success('Gym and account deleted successfully!')
        setShowDeleteModal(false)
        
        // Logout the user and redirect to landing page
        logout()
        navigate('/')
      } else {
        toast.success('Gym deleted successfully!')
        setGymData(null)
        setShowDeleteModal(false)
      }
    } catch (error) {
      console.error('Error deleting gym:', error)
      toast.error('Failed to delete gym. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gym data...</p>
        </div>
      </div>
    )
  }

  if (!gymData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Gym Found</h3>
          <p className="text-gray-600">You don't have a gym associated with your account.</p>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Gym</h1>
            <p className="text-gray-600 mt-2">Manage your gym information and members</p>
          </div>
          {!editing && (
            <div className="flex gap-3">
              <button
                onClick={handleEdit}
                className="btn-primary flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Gym Info
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn-danger flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Gym & Account
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Gym Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Gym Information</h2>
            {editing && (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="btn-secondary flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gym Name
              </label>
              {editing ? (
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  className="input-field"
                />
              ) : (
                <p className="text-gray-900 font-medium">{gymData.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              {editing ? (
                <input
                  type="text"
                  name="address"
                  value={editForm.address}
                  onChange={handleInputChange}
                  className="input-field"
                />
              ) : (
                <div className="flex items-center text-gray-900">
                  <MapPin className="w-4 h-4 mr-2" />
                  {gymData.address}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              {editing ? (
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleInputChange}
                  className="input-field"
                />
              ) : (
                <div className="flex items-center text-gray-900">
                  <Phone className="w-4 h-4 mr-2" />
                  {gymData.phone}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              {editing ? (
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleInputChange}
                  className="input-field"
                />
              ) : (
                <div className="flex items-center text-gray-900">
                  <Mail className="w-4 h-4 mr-2" />
                  {gymData.email}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              {editing ? (
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-field"
                />
              ) : (
                <p className="text-gray-900">{gymData.description || 'No description available'}</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Gym Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{gymData.total_members}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Workouts</p>
                <p className="text-2xl font-bold text-gray-900">{gymData.total_workouts}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Calories</p>
                <p className="text-2xl font-bold text-gray-900">{gymData.total_calories}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500">
                <Flame className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Members List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Gym Members</h2>
            <span className="text-sm text-gray-600">{gymData.members.length} members</span>
          </div>

          {gymData.members.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Streak
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Workouts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Calories
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {gymData.members.map((member, index) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-primary-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {member.first_name && member.last_name 
                                ? `${member.first_name} ${member.last_name}`
                                : member.username
                              }
                            </div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(member.membership_start_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {member.current_streak} days
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.total_workouts}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.total_calories}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No members yet</p>
              <p className="text-sm text-gray-500">Members will appear here once they enroll</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Gym & Account</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your gym and owner account? This action cannot be undone and will permanently remove:
            </p>
            
            <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-1">
              <li>Your owner account</li>
              <li>All gym information</li>
              <li>All member data</li>
              <li>All workout and attendance records</li>
              <li>All exercise entries and streaks</li>
            </ul>
            
            <p className="text-sm font-medium text-red-600 mb-6">
              This will permanently delete your account and all data associated with "{gymData?.name}". You will be logged out and redirected to the home page.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGym}
                className="btn-danger"
              >
                Delete Gym & Account
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default MyGym
