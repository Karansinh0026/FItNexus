import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const AdminGymApprovals = () => {
  const { user } = useAuth();
  const [pendingGyms, setPendingGyms] = useState([]);
  const [approvalStats, setApprovalStats] = useState(null);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedGym, setSelectedGym] = useState(null);
  const [notes, setNotes] = useState('');
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendingResponse, statsResponse] = await Promise.all([
        axios.get('/admin/gyms/pending/'),
        axios.get('/admin/approval-stats/')
      ]);
      setPendingGyms(pendingResponse.data);
      setApprovalStats(statsResponse.data);
      setApprovalHistory(statsResponse.data.recent_history || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleApprove = async (gymId) => {
    setSelectedGym(pendingGyms.find(gym => gym.id === gymId));
    setActionType('approve');
    setShowNotesModal(true);
  };

  const handleReject = async (gymId) => {
    setSelectedGym(pendingGyms.find(gym => gym.id === gymId));
    setActionType('reject');
    setShowNotesModal(true);
  };

  const handleActionConfirm = async () => {
    try {
      const endpoint = actionType === 'approve' 
        ? `/admin/gyms/${selectedGym.id}/approve/`
        : `/admin/gyms/${selectedGym.id}/reject/`;
      
      await axios.post(endpoint, { notes });
      setShowNotesModal(false);
      setNotes('');
      setSelectedGym(null);
      setActionType('');
      fetchData(); // Refresh data
    } catch (error) {
      console.error(`Error ${actionType}ing gym:`, error);
      alert(`Failed to ${actionType} gym`);
    }
  };

  const handleCancelAction = () => {
    setShowNotesModal(false);
    setNotes('');
    setSelectedGym(null);
    setActionType('');
  };

  const getStatusColor = (isApproved) => {
    return isApproved ? 'bg-green-100 text-green-800 ring-green-600/20' : 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
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
                Gym Approval Management
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Review and approve gym registrations from gym owners
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-50 rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-yellow-800">
                  {pendingGyms.length} Pending Review
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="border-b border-gray-200 px-6 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-600">Pending Review</p>
                  <p className="text-2xl font-semibold text-yellow-900">{approvalStats?.pending_gyms || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Today's Approvals</p>
                  <p className="text-2xl font-semibold text-green-900">{approvalStats?.today_approvals || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-600">Today's Rejections</p>
                  <p className="text-2xl font-semibold text-red-900">{approvalStats?.today_rejections || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Total History</p>
                  <p className="text-2xl font-semibold text-blue-900">{approvalHistory.length}</p>
                </div>
              </div>
            </div>

            

            
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {pendingGyms.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending gym approvals</h3>
              <p className="mt-1 text-sm text-gray-500">
                All gym registrations have been reviewed. New requests will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingGyms.map((gym) => (
                <div key={gym.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{gym.name}</h4>
                          <p className="text-sm text-gray-500">Submitted by {gym.owner_name}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusColor(gym.is_approved)}`}>
                          {gym.is_approved ? 'Approved' : 'Pending Review'}
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
                            <p><span className="font-medium">Submitted:</span> {new Date(gym.created_at).toLocaleDateString()}</p>
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

                  {!gym.is_approved && (
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleReject(gym.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(gym.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approval History Section */}
        {approvalHistory.length > 0 && (
          <div className="mt-8 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
            <div className="px-4 py-6 sm:px-6 border-b border-gray-200">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                Recent Approval History
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Recent gym approval and rejection actions
              </p>
            </div>
            <div className="px-6 py-6">
              <div className="space-y-4">
                {approvalHistory.map((history) => (
                  <div key={history.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      <div className={`h-3 w-3 rounded-full ${history.action === 'approved' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{history.gym_name}</p>
                        <p className="text-xs text-gray-500">by {history.admin_name}</p>
                        {history.notes && (
                          <p className="text-xs text-gray-600 mt-1 italic">"{history.notes}"</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{history.created_at_formatted}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        history.action === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {history.action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notes Modal */}
      {showNotesModal && selectedGym && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {actionType === 'approve' ? 'Approve' : 'Reject'} Gym
                </h3>
                <button
                  onClick={handleCancelAction}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {actionType === 'approve' ? 'Approve' : 'Reject'}: <strong>{selectedGym.name}</strong>
                </p>
                <p className="text-xs text-gray-500">Owner: {selectedGym.owner_name}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder={`Add notes for ${actionType === 'approve' ? 'approval' : 'rejection'}...`}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelAction}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleActionConfirm}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 ${
                    actionType === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                >
                  {actionType === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGymApprovals;
