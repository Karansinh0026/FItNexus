import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const GymManagement = () => {
  const { user } = useAuth();
  const [gyms, setGyms] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('gyms');
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showGymEditForm, setShowGymEditForm] = useState(false);
  const [editingGym, setEditingGym] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    duration_months: 3,
    price: '',
    description: ''
  });
  const [gymEditForm, setGymEditForm] = useState({
    name: '',
    address: '',
    phone_number: '',
    email: '',
    description: ''
  });

  useEffect(() => {
    console.log('GymManagement component mounted, user:', user);
    if (user) {
      fetchGymData();
    }
  }, [user]);

  const fetchGymData = async () => {
    try {
      // For gym owners, use the dedicated endpoint to get their gyms
      let gymsResponse;
      if (user.user_type === 'gym_owner') {
        gymsResponse = await axios.get('/gyms/my/');
        console.log('Gym owner gyms:', gymsResponse.data);
      } else {
        gymsResponse = await axios.get('/gyms/');
        console.log('All gyms:', gymsResponse.data);
      }
      
      const membershipsResponse = await axios.get('/memberships/');
      
      console.log('Current user:', user);
      console.log('User ID:', user.id);
      console.log('User type:', user.user_type);
      
      // For gym owners, the response already contains only their gyms
      // For others, filter gyms owned by the current user
      let userGyms;
      if (user.user_type === 'gym_owner') {
        userGyms = gymsResponse.data;
      } else {
        userGyms = gymsResponse.data.filter(gym => {
          console.log(`Gym ${gym.name} owner:`, gym.owner, 'User ID:', user.id, 'Match:', gym.owner === user.id);
          return gym.owner === user.id;
        });
      }
      
      console.log('User gyms:', userGyms);
      setGyms(userGyms);
      setMemberships(membershipsResponse.data);
      
      // Fetch plans for user's gyms
      if (userGyms.length > 0) {
        const plansPromises = userGyms.map(gym => 
          axios.get(`/gyms/${gym.id}/plans/`).catch(() => ({ data: [] }))
        );
        const plansResponses = await Promise.all(plansPromises);
        const allPlans = plansResponses.flatMap(response => response.data);
        setPlans(allPlans);
      }
    } catch (error) {
      console.error('Error fetching gym data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    try {
      // Assuming the first gym for now - you might want to add gym selection
      const gymId = gyms[0]?.id;
      if (!gymId) {
        alert('No gym found');
        return;
      }

      if (editingPlan) {
        // Update existing plan
        const planData = {
          ...planForm,
          gym: gymId
        };
        
        const response = await axios.put(`/plans/${editingPlan.id}/update/`, planData);
        console.log('Plan updated successfully:', response.data);
        alert('Plan updated successfully!');
      } else {
        // Check if a plan with the same duration already exists
        const existingPlan = plans.find(plan => 
          plan.gym === gymId && plan.duration_months === planForm.duration_months
        );

        if (existingPlan) {
          alert(`A ${planForm.duration_months}-month plan already exists for this gym. Please choose a different duration.`);
          return;
        }

        // Create new plan
        console.log('Submitting plan form:', planForm);
        console.log('Gym ID:', gymId);
        
        // Add the gym field to the plan data
        const planData = {
          ...planForm,
          gym: gymId
        };
        
        const response = await axios.post(`/gyms/${gymId}/plans/create/`, planData);
        console.log('Plan created successfully:', response.data);
        alert('Plan created successfully!');
      }
      
      setShowPlanForm(false);
      setEditingPlan(null);
      setPlanForm({
        duration_months: 3,
        price: '',
        description: ''
      });
      fetchGymData(); // Refresh data
    } catch (error) {
      console.error('Error creating plan:', error);
      
      // Handle specific error cases
      if (error.response?.data?.non_field_errors) {
        const nonFieldErrors = error.response.data.non_field_errors;
        if (nonFieldErrors.some(err => err.includes('unique'))) {
          alert('A plan with this duration already exists for this gym. Please choose a different duration or update the existing plan.');
        } else {
          alert(`Error: ${nonFieldErrors.join(', ')}`);
        }
      } else {
        const errorMessage = error.response?.data?.error || error.response?.data || 'Failed to create plan';
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };



  const handleMembershipAction = async (membershipId, action) => {
    try {
      if (action === 'approve') {
        await axios.post(`/memberships/${membershipId}/approve/`);
        alert('Membership approved successfully!');
      } else if (action === 'reject') {
        await axios.post(`/memberships/${membershipId}/reject/`);
        alert('Membership rejected successfully!');
      } else if (action === 'terminate') {
        if (confirm('Are you sure you want to terminate this membership?')) {
          await axios.post(`/memberships/${membershipId}/terminate/`);
          alert('Membership terminated successfully!');
        }
      }
      fetchGymData(); // Refresh data
    } catch (error) {
      console.error('Error performing membership action:', error);
      const errorMessage = error.response?.data?.error || 'Failed to perform action';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleEditGym = (gym) => {
    setEditingGym(gym);
    setGymEditForm({
      name: gym.name,
      address: gym.address,
      phone_number: gym.phone_number,
      email: gym.email,
      description: gym.description || ''
    });
    setShowGymEditForm(true);
  };

  const handleGymEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/gyms/${editingGym.id}/update/`, gymEditForm);
      alert('Gym details updated successfully!');
      setShowGymEditForm(false);
      setEditingGym(null);
      fetchGymData(); // Refresh data
    } catch (error) {
      console.error('Error updating gym:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update gym';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handlePlanEdit = (plan) => {
    setEditingPlan(plan);
    setPlanForm({
      duration_months: plan.duration_months,
      price: plan.price,
      description: plan.description || ''
    });
    setShowPlanForm(true);
  };

  const handlePlanDelete = async (planId) => {
    if (!confirm('Are you sure you want to delete this membership plan? Members associated with this plan will lose their membership and will need to choose a new plan. This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`/plans/${planId}/delete/`);
      alert('Plan deleted successfully! Members associated with this plan will need to choose a new membership plan.');
      fetchGymData(); // Refresh data
    } catch (error) {
      console.error('Error deleting plan:', error);
      const errorMessage = error.response?.data?.error || 'Failed to delete plan';
      alert(`Error: ${errorMessage}`);
    }
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gym data...</p>
        </div>
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
                Gym Management Dashboard
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Manage your gyms, membership plans, and view statistics
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'gyms', name: 'My Gyms' },
              { id: 'plans', name: 'Plans' },
              { id: 'memberships', name: 'Members' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="px-6 py-6">


          {activeTab === 'gyms' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium text-gray-900">My Gyms</h4>
              </div>
              
              {gyms.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No gyms found</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by registering your first gym.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gyms.map((gym) => (
                    <div key={gym.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-lg font-medium text-gray-900">{gym.name}</h5>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getApprovalStatusColor(gym.status)}`}>
                          {gym.status === 'approved' ? 'Approved' : gym.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium">Address:</span> {gym.address}</p>
                        <p><span className="font-medium">Phone:</span> {gym.phone_number}</p>
                        <p><span className="font-medium">Email:</span> {gym.email}</p>
                        {gym.description && (
                          <p><span className="font-medium">Description:</span> {gym.description}</p>
                        )}
                        {gym.status === 'rejected' && gym.rejection_reason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-700">
                              <span className="font-medium">Rejection Reason:</span> {gym.rejection_reason}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-3">
                          Created: {new Date(gym.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex space-x-2">
                          {gym.status === 'rejected' ? (
                            <Link
                              to="/gym-registration"
                              className="flex-1 bg-orange-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-orange-700 text-center"
                            >
                              Update Gym
                            </Link>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditGym(gym)}
                                className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                              >
                                Edit Gym
                              </button>
                              {gym.status === 'approved' && (
                                <Link
                                  to={`/gyms/${gym.id}/analytics`}
                                  className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 text-center"
                                >
                                  View Analytics
                                </Link>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="space-y-6">
              {gyms.some(gym => gym.status === 'approved') ? (
                <>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Membership Plans</h4>
                      <p className="text-sm text-gray-500 mt-1">Manage your membership plans</p>
                    </div>
                    <button
                      onClick={() => setShowPlanForm(true)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                    >
                      Add New Plan
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Approved Gym</h3>
                  <p className="text-gray-600 mb-6">
                    {gyms.some(gym => gym.status === 'rejected') 
                      ? 'Your gym was rejected. Please update your gym details and get it approved before managing membership plans.'
                      : 'You need an approved gym to manage membership plans.'
                    }
                  </p>
                  {gyms.some(gym => gym.status === 'rejected') && (
                    <Link
                      to="/gym-registration"
                      className="inline-flex items-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 transition-colors duration-200"
                    >
                      Update Gym
                    </Link>
                  )}
                </div>
              )}

              {showPlanForm && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h5 className="text-lg font-medium text-gray-900 mb-4">
                    {editingPlan ? 'Edit Membership Plan' : 'Create New Membership Plan'}
                  </h5>
                  <form onSubmit={handlePlanSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Duration (months)</label>
                        <select
                          value={planForm.duration_months}
                          onChange={(e) => setPlanForm({...planForm, duration_months: parseInt(e.target.value)})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          <option value={3}>3 months</option>
                          <option value={6}>6 months</option>
                          <option value={12}>12 months</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                        <input
                          type="number"
                          value={planForm.price}
                          onChange={(e) => setPlanForm({...planForm, price: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="Enter price"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={planForm.description}
                        onChange={(e) => setPlanForm({...planForm, description: e.target.value})}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Describe the plan benefits..."
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                      >
                        {editingPlan ? 'Update Plan' : 'Create Plan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPlanForm(false);
                          setEditingPlan(null);
                          setPlanForm({
                            duration_months: 3,
                            price: '',
                            description: ''
                          });
                        }}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {plans.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No membership plans yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Create your first membership plan to start attracting members.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <div key={plan.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-lg font-medium text-gray-900">
                          {plan.duration_months} Month{plan.duration_months > 1 ? 's' : ''}
                        </h5>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium">Price:</span> ₹{plan.price}</p>
                        {plan.description && (
                          <p><span className="font-medium">Description:</span> {plan.description}</p>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-3">
                          Plan ID: {plan.id}
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePlanEdit(plan)}
                            className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handlePlanDelete(plan.id)}
                            className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'memberships' && (
            <div className="space-y-6">
              {gyms.some(gym => gym.status === 'approved') ? (
                <>
                  <h4 className="text-lg font-medium text-gray-900">Members & Requests</h4>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Approved Gym</h3>
                  <p className="text-gray-600 mb-6">
                    {gyms.some(gym => gym.status === 'rejected') 
                      ? 'Your gym was rejected. Please update your gym details and get it approved before managing memberships.'
                      : 'You need an approved gym to manage membership requests.'
                    }
                  </p>
                  {gyms.some(gym => gym.status === 'rejected') && (
                    <Link
                      to="/gym-registration"
                      className="inline-flex items-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 transition-colors duration-200"
                    >
                      Update Gym
                    </Link>
                  )}
                </div>
              )}
              
              {gyms.some(gym => gym.status === 'approved') && (
                <>
                  {memberships.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No membership requests</h3>
                  <p className="mt-1 text-sm text-gray-500">Membership requests will appear here when members apply.</p>
                </div>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gym</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {memberships.map((membership) => (
                        <tr key={membership.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{membership.member_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{membership.gym_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{membership.plan_details}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(membership.status)}`}>
                              {membership.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(membership.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {membership.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleMembershipAction(membership.id, 'approve')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleMembershipAction(membership.id, 'reject')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {membership.status === 'approved' && (
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleMembershipAction(membership.id, 'terminate')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Terminate
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
                </>
              )}
            </div>
          )}


        </div>
      </div>

      {/* Gym Edit Modal */}
      {showGymEditForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Gym Details</h3>
              <form onSubmit={handleGymEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gym Name</label>
                  <input
                    type="text"
                    value={gymEditForm.name}
                    onChange={(e) => setGymEditForm({...gymEditForm, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    value={gymEditForm.address}
                    onChange={(e) => setGymEditForm({...gymEditForm, address: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    value={gymEditForm.phone_number}
                    onChange={(e) => setGymEditForm({...gymEditForm, phone_number: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={gymEditForm.email}
                    onChange={(e) => setGymEditForm({...gymEditForm, email: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={gymEditForm.description}
                    onChange={(e) => setGymEditForm({...gymEditForm, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    Update Gym
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowGymEditForm(false);
                      setEditingGym(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymManagement;
