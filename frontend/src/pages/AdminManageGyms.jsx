import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const AdminManageGyms = () => {
  const { user } = useAuth();
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, approved, pending

  useEffect(() => {
    fetchGyms();
  }, []);

  const fetchGyms = async () => {
    try {
      const response = await axios.get('/admin/gyms/all/');
      setGyms(response.data);
    } catch (error) {
      console.error('Error fetching gyms:', error);
    } finally {
      setLoading(false);
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
      default:
        return 'bg-gray-100 text-gray-800 ring-gray-600/20';
    }
  };

  const getFilteredGyms = () => {
    switch (filter) {
      case 'approved':
        return gyms.filter(gym => gym.status === 'approved');
      case 'pending':
        return gyms.filter(gym => gym.status === 'pending');
      default:
        return gyms;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const filteredGyms = getFilteredGyms();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-white border border-gray-300 rounded p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Gym Management
              </h3>
              <p className="text-sm text-gray-600">
                Overview of all gyms in the system
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-600">Total Gyms</span>
              <p className="text-xl font-semibold text-gray-900">{gyms.length}</p>
            </div>
          </div>
        </div>
      </div>

        {/* Stats */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-300 p-4 rounded">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Gyms</p>
                  <p className="text-xl font-semibold text-gray-900">{gyms.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-300 p-4 rounded">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-xl font-semibold text-gray-900">{gyms.filter(g => g.status === 'approved').length}</p>
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
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-semibold text-gray-900">{gyms.filter(g => g.status === 'pending').length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <div className="bg-white border border-gray-300 rounded p-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded ${
                  filter === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All ({gyms.length})
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-3 py-1 text-sm rounded ${
                  filter === 'approved'
                    ? 'bg-slate-800 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Approved ({gyms.filter(g => g.status === 'approved').length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1 text-sm rounded ${
                  filter === 'pending'
                    ? 'bg-slate-800 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pending ({gyms.filter(g => g.status === 'pending').length})
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          {filteredGyms.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No gyms found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' ? 'No gyms have been registered yet.' : 
                 filter === 'approved' ? 'No approved gyms found.' : 'No pending gyms found.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGyms.map((gym) => (
                <div key={gym.id} className="bg-white border border-gray-300 rounded p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{gym.name}</h4>
                          <p className="text-sm text-gray-600">Owner: {gym.owner_name}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded ${getStatusColor(gym.status)}`}>
                          {gym.status === 'approved' ? 'Approved' : gym.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h5>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">Address:</span> {gym.address}</p>
                            <p><span className="font-medium">Phone:</span> {gym.phone}</p>
                            <p><span className="font-medium">Email:</span> {gym.email}</p>
                          </div>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Details</h5>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">Owner:</span> {gym.owner_name}</p>
                            <p><span className="font-medium">Registered:</span> {new Date(gym.created_at).toLocaleDateString()}</p>
                            <p><span className="font-medium">Gym ID:</span> {gym.id}</p>
                          </div>
                        </div>
                      </div>

                      {gym.description && (
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Description</h5>
                          <p className="text-sm text-gray-600 bg-gray-50 rounded-md p-3">
                            {gym.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    {gym.status === 'pending' && (
                      <button
                        onClick={() => window.open(`/admin/gym-approvals`, '_blank')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Review for Approval
                      </button>
                    )}
                    <span className="text-sm text-gray-500">
                      {gym.status === 'approved' ? 'Approved' : gym.status === 'rejected' ? 'Rejected' : 'Awaiting approval'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
};

export default AdminManageGyms;
