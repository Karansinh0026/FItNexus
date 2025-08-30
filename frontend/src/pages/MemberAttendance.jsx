import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const MemberAttendance = () => {
  const { user } = useAuth();
  const { gymId } = useParams();
  const [gym, setGym] = useState(null);
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  useEffect(() => {
    fetchGymData();
    checkTodayAttendance();
  }, [gymId]);

  const fetchGymData = async () => {
    try {
      const gymResponse = await axios.get(`/gyms/${gymId}/`);
      setGym(gymResponse.data);
    } catch (error) {
      console.error('Error fetching gym data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkTodayAttendance = async () => {
    try {
      const response = await axios.get(`/gyms/${gymId}/attendance/stats/`);
      setStats(response.data);
      
      // Check if attendance is already marked today
      const today = new Date().toISOString().split('T')[0];
      const todayAttendanceCheck = await axios.get(`/gyms/${gymId}/attendance/check-today/`);
      setTodayAttendance(todayAttendanceCheck.data.marked);
    } catch (error) {
      console.error('Error checking today attendance:', error);
    }
  };

  const handleMarkAttendance = async () => {
    setMarkingAttendance(true);
    try {
      const response = await axios.post(`/gyms/${gymId}/attendance/mark/`);
      alert('✅ Attendance marked successfully! Keep up the great work!');
      setTodayAttendance(true);
      await checkTodayAttendance(); // Refresh stats
    } catch (error) {
      console.error('Error marking attendance:', error);
      const errorMessage = error.response?.data?.error || 'Failed to mark attendance';
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setMarkingAttendance(false);
    }
  };

  const handleViewStats = async () => {
    setShowStats(true);
    try {
      const [statsResponse, leaderboardResponse, historyResponse] = await Promise.all([
        axios.get(`/gyms/${gymId}/attendance/stats/`),
        axios.get(`/gyms/${gymId}/attendance/leaderboard/`),
        axios.get(`/gyms/${gymId}/attendance/history/`)
      ]);
      
      setStats(statsResponse.data);
      setLeaderboard(leaderboardResponse.data);
      setAttendanceHistory(historyResponse.data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getStreakColor = (streak) => {
    if (streak >= 7) return 'text-green-600';
    if (streak >= 3) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Gym not found</h3>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl mb-6">
        <div className="px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                Attendance Dashboard - {gym.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Mark your daily attendance and track your progress
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={checkTodayAttendance}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Mark Attendance Card */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
          <div className="px-4 py-6 sm:px-6">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">Mark Attendance</h4>
                <p className="text-sm text-gray-500">Mark your daily attendance</p>
              </div>
            </div>

            {todayAttendance ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-800 font-medium">Attendance already marked for today!</span>
                </div>
                <p className="text-green-600 text-sm mt-1">
                  Great job! Come back tomorrow to continue your streak.
                </p>
              </div>
            ) : (
              <button
                onClick={handleMarkAttendance}
                disabled={markingAttendance}
                className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {markingAttendance ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Marking Attendance...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Mark Today's Attendance
                  </div>
                )}
              </button>
            )}
          </div>
        </div>

        {/* View Stats Card */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
          <div className="px-4 py-6 sm:px-6">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">View Stats & Leaderboard</h4>
                <p className="text-sm text-gray-500">Check your progress and rankings</p>
              </div>
            </div>

            <button
              onClick={handleViewStats}
              className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <div className="flex items-center justify-center">
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View My Stats
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Stats and Leaderboard Section */}
      {showStats && (
        <div className="space-y-6">
          {/* Quick Stats */}
          {stats && (
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
              <div className="px-4 py-6 sm:px-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Your Attendance Stats</h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                    <div className="text-2xl font-bold">{stats.total_attendance}</div>
                    <div className="text-sm opacity-90">Total Days</div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                    <div className="text-2xl font-bold">{stats.current_streak}</div>
                    <div className="text-sm opacity-90">Current Streak</div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                    <div className="text-2xl font-bold">{stats.longest_streak}</div>
                    <div className="text-sm opacity-90">Longest Streak</div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                    <div className="text-2xl font-bold">{stats.attendance_percentage}%</div>
                    <div className="text-sm opacity-90">Attendance Rate</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance History */}
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
              <div className="px-4 py-6 sm:px-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Attendance</h4>
                
                {attendanceHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance history</h3>
                    <p className="mt-1 text-sm text-gray-500">Start marking attendance to see your history!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {attendanceHistory.slice(0, 10).map((attendance) => (
                      <div key={attendance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-900">{formatDate(attendance.date)}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Streak: {attendance.streak_count} days
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
              <div className="px-4 py-6 sm:px-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Gym Leaderboard</h4>
                
                {leaderboard.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance data</h3>
                    <p className="mt-1 text-sm text-gray-500">Be the first to mark attendance!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.slice(0, 8).map((entry) => (
                      <div
                        key={entry.member_id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          entry.member_id === user.id
                            ? 'bg-indigo-50 border-indigo-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-bold text-gray-900">
                            {getRankIcon(entry.rank)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {entry.member_name}
                              {entry.member_id === user.id && (
                                <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {entry.total_attendance} days • {entry.attendance_percentage}%
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${getStreakColor(entry.current_streak)}`}>
                            🔥 {entry.current_streak} day streak
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberAttendance;
