import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [gyms, setGyms] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      console.log('Dashboard - fetchDashboardData called with user:', user);
      console.log('Dashboard - User type:', user?.user_type);
      
      if (user?.user_type === 'gym_owner') {
        const [gymsResponse, membershipsResponse, noticesResponse] = await Promise.all([
          axios.get('/gyms/my/'),
          axios.get('/memberships/'),
          axios.get('/notices/')
        ]);
        console.log('Dashboard - Gym owner gyms:', gymsResponse.data);
        console.log('Dashboard - User:', user);
        setGyms(gymsResponse.data);
        setMemberships(membershipsResponse.data);
        setNotices(noticesResponse.data.slice(0, 3)); // Show only 3 recent notices
      } else if (user?.user_type === 'member') {
        const [membershipsResponse, noticesResponse] = await Promise.all([
          axios.get('/memberships/'),
          axios.get('/notices/')
        ]);
        setMemberships(membershipsResponse.data);
        setNotices(noticesResponse.data.slice(0, 3)); // Show only 3 recent notices
        

      } else if (user?.user_type === 'admin') {
        const [gymsResponse, noticesResponse] = await Promise.all([
          axios.get('/admin/gyms/pending/'),
          axios.get('/notices/')
        ]);
        setGyms(gymsResponse.data);
        setNotices(noticesResponse.data.slice(0, 3)); // Show only 3 recent notices
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getUserTypeDisplay = (userType) => {
    switch (userType) {
      case 'admin':
        return 'Admin';
      case 'gym_owner':
        return 'Gym Owner';
      case 'member':
        return 'Member';
      default:
        return userType;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
      case 'approved':
        return 'bg-green-100 text-green-800 ring-green-600/20';
      case 'rejected':
        return 'bg-red-100 text-red-800 ring-red-600/20';
      case 'terminated':
        return 'bg-gray-100 text-gray-800 ring-gray-600/20';
      case 'active':
        return 'bg-blue-100 text-blue-800 ring-blue-600/20';
      case 'expired':
        return 'bg-gray-100 text-gray-800 ring-gray-600/20';
      default:
        return 'bg-gray-100 text-gray-800 ring-gray-600/20';
    }
  };

  const calculateRemainingDays = (endDate) => {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-slate-900 shadow-sm">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="bg-slate-800 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold mb-2">
                Hey {user?.first_name}, welcome back!
              </h1>
              <p className="text-slate-300 mb-3">
                {user?.user_type === 'member' && "How's your fitness journey going?"}
                {user?.user_type === 'gym_owner' && "Let's see how your gym is doing today."}
                {user?.user_type === 'admin' && "Here's what needs your attention."}
              </p>
              <span className="inline-block bg-slate-700 px-3 py-1 rounded text-sm">
                {getUserTypeDisplay(user?.user_type || '')}
              </span>
            </div>
            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-lg font-medium">
              {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mb-8">

        {user?.user_type === 'gym_owner' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-300 p-4 rounded">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Your Gyms</p>
                  <p className="text-xl font-semibold text-gray-900">{gyms.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-300 p-4 rounded">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Members</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {memberships.filter(m => m.status === 'approved').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-300 p-4 rounded">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Requests</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {memberships.filter(m => m.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {user?.user_type === 'admin' && (
          <div className="bg-white border border-gray-300 p-4 rounded">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gyms Pending Review</p>
                <p className="text-xl font-semibold text-gray-900">{gyms.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Member Dashboard */}
      {user?.user_type === 'member' && (
        <div className="mb-8">
          <div className="bg-white border border-gray-300 rounded">
            <div className="p-4 border-b border-gray-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Your Memberships</h3>
                  <p className="text-sm text-gray-600">Keep track of your gym memberships</p>
                </div>
                <button
                  onClick={fetchDashboardData}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {memberships.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No memberships yet</h3>
                <p className="text-gray-600 mb-6">Get started by browsing available gyms and joining your first membership.</p>
                <div className="space-x-3">
                  <Link
                    to="/gyms"
                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors duration-200"
                  >
                    Browse Gyms
                  </Link>
                  <Link
                    to="/my-memberships"
                    className="inline-flex items-center rounded-lg bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 transition-colors duration-200"
                  >
                    My Memberships
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {memberships.map((membership) => {
                  const remainingDays = calculateRemainingDays(membership.end_date);
                  return (
                    <div key={membership.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{membership.gym_name}</h4>
                            <p className="text-sm text-gray-600">{membership.plan_details}</p>
                            {remainingDays !== null && (
                              <p className="text-sm text-gray-500">
                                {remainingDays > 0 ? `${remainingDays} days remaining` : 'Expired'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(membership.status)}`}>
                            {membership.status}
                          </span>
                          {membership.status === 'approved' && (
                            <Link
                              to={`/gyms/${membership.gym}/attendance`}
                              className="inline-flex items-center rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-colors duration-200"
                            >
                              Mark Attendance
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gym Owner Dashboard */}
      {user?.user_type === 'gym_owner' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">My Gyms</h3>
                <p className="mt-1 text-sm text-gray-600">Manage your gym registrations and memberships.</p>
              </div>
              {gyms.some(gym => gym.status === 'rejected') ? (
                <Link
                  to="/gym-registration"
                  className="inline-flex items-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 transition-colors duration-200"
                >
                  Update Gym
                </Link>
              ) : (
                <Link
                  to="/gym-registration"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors duration-200"
                >
                  Register New Gym
                </Link>
              )}
            </div>
          </div>
          <div className="p-6">
            {gyms.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No gyms registered</h3>
                <p className="text-gray-600 mb-6">Start by registering your first gym to begin attracting members.</p>
                <Link
                  to="/gym-registration"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors duration-200"
                >
                  Register Your First Gym
                </Link>
              </div>
            ) : gyms.some(gym => gym.status === 'rejected') ? (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Gym Registration Rejected</h3>
                <p className="text-gray-600 mb-6">Your gym registration was rejected. You can update the details and resubmit for approval.</p>
                <Link
                  to="/gym-registration"
                  className="inline-flex items-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 transition-colors duration-200"
                >
                  Update Gym
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {gyms.map((gym) => (
                  <div key={gym.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{gym.name}</h4>
                          <p className="text-sm text-gray-600">{gym.address}</p>
                          <p className="text-sm text-gray-500">{gym.phone}</p>
                          {gym.status === 'rejected' && gym.rejection_reason && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                              <p className="text-xs text-red-700">
                                <strong>Rejection Reason:</strong> {gym.rejection_reason}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(gym.status)}`}>
                          {gym.status === 'approved' ? 'Approved' : gym.status === 'rejected' ? 'Rejected' : 'Pending Approval'}
                        </span>
                        <Link
                          to="/gym-management"
                          className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors duration-200"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Dashboard */}
      {user?.user_type === 'admin' && (
        <>


          {/* Pending Approvals */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Pending Gym Approvals</h3>
                  <p className="mt-1 text-sm text-gray-600">Review and approve gym registration requests.</p>
                </div>
                <Link
                  to="/admin/gym-approvals"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors duration-200"
                >
                  View All Approvals
                </Link>
              </div>
            </div>
            <div className="p-6">
              {gyms.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending approvals</h3>
                  <p className="text-gray-600 mb-6">All gym registrations have been reviewed and processed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {gyms.map((gym) => (
                    <div key={gym.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{gym.name}</h4>
                            <p className="text-sm text-gray-600">{gym.address}</p>
                            <p className="text-sm text-gray-500">Owner: {gym.owner_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset bg-yellow-100 text-yellow-800 ring-yellow-600/20">
                            Pending Review
                          </span>
                          <Link
                            to="/admin/gym-approvals"
                            className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors duration-200"
                          >
                            Review
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Notice Board Section */}
      <div className="mb-8">
        <div className="bg-white border border-gray-300 rounded">
          <div className="p-4 border-b border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Notices</h3>
                <p className="text-sm text-gray-600">Latest updates from your gyms</p>
              </div>
              <Link
                to="/notice-board"
                className="px-3 py-1 text-sm bg-slate-800 text-white rounded hover:bg-slate-700"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-4">
            {notices.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-600">No notices yet</p>
                <p className="text-xs text-gray-500">Check back later for updates</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notices.map((notice) => (
                  <div key={notice.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{notice.title}</h4>
                        <p className="text-xs text-gray-600 mb-1">{notice.gym_name}</p>
                        <p className="text-sm text-gray-700">{notice.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notice.created_at_formatted}
                        </p>
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
  );
};

export default Dashboard;
