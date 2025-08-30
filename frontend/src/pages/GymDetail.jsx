import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const GymDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [gym, setGym] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requesting, setRequesting] = useState(null);

  useEffect(() => {
    if (id) {
      fetchGymDetails();
    }
  }, [id]);

  const fetchGymDetails = async () => {
    try {
      const [gymResponse, plansResponse] = await Promise.all([
        axios.get(`/gyms/${id}/`),
        axios.get(`/gyms/${id}/plans/`)
      ]);
      setGym(gymResponse.data);
      setPlans(plansResponse.data);
    } catch (error) {
      setError('Failed to fetch gym details');
      console.error('Error fetching gym details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMembershipRequest = async (planId) => {
    if (!user || user.user_type !== 'member') {
      alert('Only members can request memberships');
      return;
    }

    setRequesting(planId);
    try {
      console.log('Sending membership request for plan:', planId, 'gym:', id);
      const response = await axios.post(`/gyms/${id}/plans/${planId}/request/`);
      console.log('Membership request response:', response.data);
      
      // Use the message from the response if available
      const successMessage = response.data?.message || 'Membership request sent successfully! The gym owner will review your request.';
      alert(successMessage);
    } catch (error) {
      console.error('Membership request error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to send membership request';
      alert(`Error: ${errorMessage}`);
    } finally {
      setRequesting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading gym details...</div>
      </div>
    );
  }

  if (error || !gym) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error || 'Gym not found'}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{gym.name}</h1>
        <p className="text-gray-600 mb-6">{gym.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Information</h3>
            <div className="space-y-2 text-gray-600">
              <p><span className="font-medium">Address:</span> {gym.address}</p>
              <p><span className="font-medium">Phone:</span> {gym.phone_number}</p>
              <p><span className="font-medium">Email:</span> {gym.email}</p>
              <p><span className="font-medium">Owner:</span> {gym.owner_name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Membership Plans</h2>

        {plans.length === 0 ? (
          <p className="text-gray-500">No membership plans available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className="border rounded-lg p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {plan.duration_months} Month{plan.duration_months > 1 ? 's' : ''}
                </h3>
                <div className="text-3xl font-bold text-blue-600 mb-4">
                  ₹{plan.price}
                </div>
                {plan.description && (
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                )}

                {user?.user_type === 'member' ? (
                  <button
                    onClick={() => handleMembershipRequest(plan.id)}
                    disabled={requesting === plan.id}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded transition-colors"
                  >
                    {requesting === plan.id ? 'Requesting...' : 'Request Membership'}
                  </button>
                ) : (
                  <p className="text-gray-500 text-sm">
                    {user ? 'Only members can request memberships' : 'Please log in to request membership'}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GymDetail;
