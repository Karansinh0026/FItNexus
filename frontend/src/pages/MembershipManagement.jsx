import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const MembershipManagement = () => {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      const response = await axios.get('/memberships/');
      setMemberships(response.data);
    } catch (error) {
      console.error('Error fetching memberships:', error);
    } finally {
      setLoading(false);
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

  const getMembershipStatus = (membership) => {
    if (membership.status === 'pending') return 'Pending Approval';
    if (membership.status === 'rejected') return 'Rejected';
    if (membership.status === 'terminated') return 'Terminated';
    if (membership.status === 'expired') return 'Expired';
    
    // For approved/active memberships, check if expired
    if (membership.end_date) {
      const remainingDays = calculateRemainingDays(membership.end_date);
      if (remainingDays <= 0) return 'Expired';
      if (remainingDays <= 7) return 'Expiring Soon';
      return 'Active';
    }
    
    return 'Active';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Expiring Soon': return 'bg-yellow-100 text-yellow-800';
      case 'Pending Approval': return 'bg-blue-100 text-blue-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Terminated': return 'bg-gray-100 text-gray-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        {/* Header */}
        <div className="px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                My Memberships
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                View and manage your gym memberships
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {memberships.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No memberships found</h3>
              <p className="mt-1 text-sm text-gray-500">Start by browsing gyms and requesting memberships.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memberships.map((membership) => {
                const status = getMembershipStatus(membership);
                const remainingDays = calculateRemainingDays(membership.end_date);
                
                return (
                  <div key={membership.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-lg font-medium text-gray-900">{membership.gym_name}</h5>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {status}
                      </span>
                    </div>
                    
                    <div className="space-y-3 text-sm text-gray-600">
                      <p><span className="font-medium">Plan:</span> {membership.plan_details}</p>
                      <p><span className="font-medium">Status:</span> {membership.status}</p>
                      
                      {membership.start_date && (
                        <p><span className="font-medium">Start Date:</span> {new Date(membership.start_date).toLocaleDateString()}</p>
                      )}
                      
                      {membership.end_date && (
                        <p><span className="font-medium">End Date:</span> {new Date(membership.end_date).toLocaleDateString()}</p>
                      )}
                      
                      {remainingDays !== null && membership.status === 'approved' && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          {remainingDays > 0 ? (
                            <p className="text-center">
                              <span className="font-medium text-lg text-indigo-600">{remainingDays}</span>
                              <br />
                              <span className="text-sm text-gray-500">
                                {remainingDays === 1 ? 'day' : 'days'} remaining
                              </span>
                            </p>
                          ) : (
                            <p className="text-center text-red-600 font-medium">
                              Membership Expired
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    {status === 'Active' && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Link
                          to={`/gyms/${membership.gym}/attendance`}
                          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          View Attendance
                        </Link>
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Requested: {new Date(membership.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembershipManagement;
