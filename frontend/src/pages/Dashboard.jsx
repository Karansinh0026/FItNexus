import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Activity, 
  TrendingUp, 
  Flame, 
  Calendar,
  Clock,
  Target,
  Award,
  Users,
  Plus,
  Building,
  UserCheck,
  Dumbbell,
  CheckCircle
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [leaderboard, setLeaderboard] = useState([])
  const [attendanceMarked, setAttendanceMarked] = useState(false)
  const [attendanceTime, setAttendanceTime] = useState(null)
  const [markingAttendance, setMarkingAttendance] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    checkAttendanceToday()
    
    // Set up interval to check for date changes (every minute)
    const interval = setInterval(() => {
      const now = new Date()
      const currentDate = now.toDateString()
      
      // If we have attendance marked, check if the date has changed
      if (attendanceMarked && attendanceTime) {
        const attendanceDate = new Date(attendanceTime).toDateString()
        if (currentDate !== attendanceDate) {
          // Date has changed, refresh attendance status
          checkAttendanceToday()
        }
      }
    }, 60000) // Check every minute
    
    return () => clearInterval(interval)
  }, [attendanceMarked, attendanceTime])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, leaderboardResponse] = await Promise.all([
        axios.get('/api/dashboard/stats/'),
        axios.get('/api/leaderboard/')
      ])
      
      setStats(statsResponse.data)
      setLeaderboard(leaderboardResponse.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.')
      } else if (error.response?.status === 404) {
        // User is not enrolled in a gym
        setStats({ not_enrolled: true })
        setLeaderboard([])
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Please check your permissions.')
      } else {
        toast.error('Failed to load dashboard data. Please refresh the page.')
      }
    } finally {
      setLoading(false)
    }
  }

  const checkAttendanceToday = async () => {
    try {
      const response = await axios.get('/api/attendance/check-today/')
      setAttendanceMarked(response.data.attendance_marked)
      setAttendanceTime(response.data.attendance_time)
    } catch (error) {
      console.error('Error checking attendance:', error)
    }
  }

  const markAttendance = async () => {
    if (attendanceMarked) {
      toast.error('Attendance already marked for today!')
      return
    }

    setMarkingAttendance(true)
    try {
      await axios.post('/api/attendance/')
      toast.success('Attendance marked successfully!')
      setAttendanceMarked(true)
      setAttendanceTime(new Date().toISOString())
      fetchDashboardData() // Refresh data
    } catch (error) {
      console.error('Error marking attendance:', error)
      if (error.response?.status === 400) {
        toast.error('Attendance already marked for today!')
        setAttendanceMarked(true)
        checkAttendanceToday() // Refresh attendance status
      } else {
        toast.error('Failed to mark attendance')
      }
    } finally {
      setMarkingAttendance(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Different stat cards for members vs admins
  const getStatCards = () => {
    if (user?.role === 'admin') {
      return [
        {
          title: 'Total Gyms',
          value: stats?.total_gyms || 0,
          icon: Building,
          color: 'bg-blue-500',
          change: '+1 gym'
        },
        {
          title: 'Total Members',
          value: stats?.total_members || 0,
          icon: Users,
          color: 'bg-green-500',
          change: '+5 members'
        },
        {
          title: 'Active Members',
          value: stats?.active_members || 0,
          icon: UserCheck,
          color: 'bg-orange-500',
          change: '+3 active'
        },
        {
          title: 'Avg Attendance',
          value: `${stats?.avg_attendance_rate || 0}%`,
          icon: Calendar,
          color: 'bg-purple-500',
          change: '+2%'
        }
      ]
    } else {
      return [
        {
          title: 'Total Workouts',
          value: stats?.total_workouts || 0,
          icon: Activity,
          color: 'bg-blue-500',
          change: '+12%'
        },
        {
          title: 'Current Streak',
          value: stats?.current_streak || 0,
          icon: TrendingUp,
          color: 'bg-green-500',
          change: '+3 days'
        },
        {
          title: 'Calories Burned',
          value: stats?.total_calories_burned || 0,
          icon: Flame,
          color: 'bg-orange-500',
          change: '+450 cal'
        },
        {
          title: attendanceMarked ? 'Today\'s Attendance' : 'Attendance Rate',
          value: attendanceMarked ? '✓ Marked' : `${stats?.attendance_rate || 0}%`,
          icon: attendanceMarked ? CheckCircle : Calendar,
          color: attendanceMarked ? 'bg-green-500' : 'bg-purple-500',
          change: attendanceMarked ? 'Today' : '+5%'
        }
      ]
    }
  }

  const statCards = getStatCards()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name || user?.username}!
        </h1>
        <p className="text-gray-600 mt-2">
          {user?.role === 'admin' 
            ? 'Here\'s your gym management overview' 
            : 'Here\'s your fitness overview for today'
          }
        </p>
      </motion.div>

      {/* Gym Enrollment Prompt - Only show for members who are not enrolled */}
      {user?.role === 'member' && stats?.not_enrolled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Building className="w-8 h-8 text-blue-600 mr-4" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Join a Gym</h2>
                  <p className="text-gray-600">You need to enroll in a gym to start tracking your fitness journey</p>
                </div>
              </div>
              <Link
                to="/gym-enrollment"
                className="btn-primary flex items-center gap-2"
              >
                <Building className="w-4 h-4" />
                Find Gym
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Gym Information - Only show for enrolled members */}
      {user?.role === 'member' && stats?.gym_info && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Building className="w-8 h-8 text-primary-600 mr-4" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Your Gym</h2>
                  <p className="text-gray-600">{stats.gym_info.name}</p>
                  <p className="text-sm text-gray-500">{stats.gym_info.address}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{stats.gym_info.phone}</p>
                <p className="text-sm text-gray-600">{stats.gym_info.email}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions - Only show for enrolled members */}
      {user?.role === 'member' && stats?.gym_info && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-2">
              <button
                onClick={markAttendance}
                className={`flex items-center gap-2 ${
                  attendanceMarked 
                    ? 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-not-allowed' 
                    : 'btn-primary'
                }`}
                disabled={attendanceMarked || markingAttendance}
              >
                {markingAttendance ? (
                  <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : attendanceMarked ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {attendanceMarked ? 'Attendance Marked' : 'Mark Attendance'}
              </button>
              {attendanceMarked && attendanceTime && (
                <p className="text-xs text-gray-600 text-center">
                  Marked at {new Date(attendanceTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
            <Link
              to="/exercise-tracking"
              className="btn-secondary flex items-center gap-2"
            >
              <Dumbbell className="w-4 h-4" />
              Log Exercise
            </Link>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content varies based on user role */}
        {user?.role === 'admin' ? (
          // Admin Dashboard Content - Check if user owns a gym
          <>
            {stats?.gym_info ? (
              // Gym Owner Dashboard - Show their gym info and members
              <>
                {/* Gym Owner Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-2"
                >
                  <div className="card">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">My Gym Overview</h2>
                      <Link 
                        to="/my-gym"
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Manage Gym
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Users className="w-8 h-8 text-blue-600 mr-3" />
                          <div>
                            <p className="text-sm text-blue-600">Total Members</p>
                            <p className="text-2xl font-bold text-blue-900">{stats.total_members || 0}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Activity className="w-8 h-8 text-green-600 mr-3" />
                          <div>
                            <p className="text-sm text-green-600">Active Members</p>
                            <p className="text-2xl font-bold text-green-900">{stats.active_members || 0}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
                          <div>
                            <p className="text-sm text-purple-600">Avg Attendance</p>
                            <p className="text-2xl font-bold text-purple-900">{stats.avg_attendance_rate || 0}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Gym Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Gym Name</p>
                          <p className="font-medium text-gray-900">{stats.gym_info.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Address</p>
                          <p className="font-medium text-gray-900">{stats.gym_info.address}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium text-gray-900">{stats.gym_info.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">{stats.gym_info.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            ) : (
              // Super Admin Dashboard - Show system overview
              <>
                {/* System Overview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-2"
                >
                  <div className="card">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">System Overview</h2>
                      <Link 
                        to="/gym-management"
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Manage Gyms
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Building className="w-8 h-8 text-blue-600 mr-3" />
                          <div>
                            <p className="text-sm text-blue-600">Total Gyms</p>
                            <p className="text-2xl font-bold text-blue-900">{stats.total_gyms || 0}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Users className="w-8 h-8 text-green-600 mr-3" />
                          <div>
                            <p className="text-sm text-green-600">Total Members</p>
                            <p className="text-2xl font-bold text-green-900">{stats.total_members || 0}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
                          <div>
                            <p className="text-sm text-purple-600">Active Members</p>
                            <p className="text-2xl font-bold text-purple-900">{stats.active_members || 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Members</h3>
                      {stats?.top_members?.length > 0 ? (
                        <div className="space-y-3">
                          {stats.top_members.map((member, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                  <Award className="w-4 h-4 text-primary-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{member.username}</p>
                                  <p className="text-sm text-gray-600">
                                    Longest streak: {member.longest_streak} days
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                  Current: {member.current_streak} days
                                </p>
                                <p className="text-xs text-gray-600">
                                  Rank #{index + 1}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">No members yet</p>
                          <p className="text-sm text-gray-500">Members will appear here once they join</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </>
        ) : (
          // Member Dashboard Content
          <>
            {/* Recent Workouts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Workouts</h2>
                  <Link 
                    to="/exercise-tracking"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
                
                {stats?.recent_workouts?.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recent_workouts.map((workout, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Dumbbell className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{workout.exercise_name}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(workout.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {workout.calories_burned} calories
                          </p>
                          <p className="text-xs text-gray-600">
                            {workout.duration} minutes
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent workouts</p>
                    <p className="text-sm text-gray-500">Start tracking your exercises to see your progress!</p>
                    <Link
                      to="/exercise-tracking"
                      className="btn-primary mt-4 inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Log Your First Exercise
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}

        {/* Leaderboard - Same for both */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Leaderboard</h2>
              <Award className="w-5 h-5 text-primary-600" />
            </div>
            
            {leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">{entry.username}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{entry.longest_streak} days</p>
                      <p className="text-xs text-gray-600">Current: {entry.current_streak}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No leaderboard data</p>
                <p className="text-sm text-gray-500">Start working out to see rankings!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
