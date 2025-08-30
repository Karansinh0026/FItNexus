import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const GymRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.user_type !== 'gym_owner') {
      navigate('/dashboard');
    }
    
    // Check if user already has a gym
    if (user && user.user_type === 'gym_owner') {
      const checkExistingGym = async () => {
        try {
          const response = await axios.get('/gyms/my/');
          if (response.data && response.data.length > 0) {
            const existingGym = response.data[0];
            
                         // Allow registration if the existing gym is rejected
             if (existingGym.status === 'rejected') {
               setSuccess(
                 `Your gym "${existingGym.name}" was rejected. You can update the details and resubmit for approval. ` +
                 `Reason: ${existingGym.rejection_reason || 'No reason provided'}`
               );
               // Pre-fill the form with existing gym data
               setFormData({
                 name: existingGym.name,
                 address: existingGym.address,
                 phone: existingGym.phone,
                 email: existingGym.email,
                 description: existingGym.description || ''
               });
             } else if (existingGym.status === 'approved') {
              setError(
                `You already have an approved gym: "${existingGym.name}". Each gym owner can only have one approved gym. ` +
                `If you need to update your gym information, please use the gym management section.`
              );
              setTimeout(() => {
                navigate('/dashboard');
              }, 3000);
            } else if (existingGym.status === 'pending') {
              setError(
                `You already have a gym pending approval: "${existingGym.name}". Please wait for admin review. ` +
                `If you need to update your gym information, please use the gym management section.`
              );
              setTimeout(() => {
                navigate('/dashboard');
              }, 3000);
            }
          }
        } catch (error) {
          console.error('Error checking existing gym:', error);
        }
      };
      
      checkExistingGym();
    }
  }, [user, navigate]);

  const validateField = (name, value) => {
    let fieldError = '';
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          fieldError = 'Gym name is required';
        } else if (value.trim().length < 3) {
          fieldError = 'Gym name must be at least 3 characters';
        }
        break;
        
      case 'address':
        if (!value.trim()) {
          fieldError = 'Address is required';
        } else if (value.trim().length < 10) {
          fieldError = 'Address must be at least 10 characters';
        }
        break;
        
      case 'phone':
        if (!value.trim()) {
          fieldError = 'Phone number is required';
        } else if (!/^[0-9]{10}$/.test(value.trim())) {
          fieldError = 'Phone number must be exactly 10 digits';
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          fieldError = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          fieldError = 'Please enter a valid email address';
        }
        break;
        
      default:
        break;
    }
    
    return fieldError;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);
    setErrors({
      ...errors,
      [name]: fieldError
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate all required fields
    Object.keys(formData).forEach(field => {
      if (field !== 'description') { // description is optional
        const fieldError = validateField(field, formData[field]);
        if (fieldError) {
          newErrors[field] = fieldError;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const response = await axios.post('/gyms/create/', formData);
      setSuccess(response.data.message);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Gym registration error:', error.response?.data);
      
      // Handle specific error for existing gym
      if (error.response?.data?.error && error.response.data.error.includes('already have a gym')) {
        const existingGym = error.response.data.existing_gym;
        setError(
          `You already have a gym registered: "${existingGym.name}". Each gym owner can only have one gym. ` +
          `If you need to update your gym information, please use the gym management section.`
        );
      } else {
        setError(error.response?.data?.error || error.response?.data?.message || 'Failed to register gym');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.user_type !== 'gym_owner') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">Only gym owners can register gyms.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
            <div className="flex items-center justify-center">
              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
                         <h2 className="mt-4 text-center text-2xl font-bold text-white">
               {success && success.includes('was rejected') ? 'Update Your Gym' : 'Register Your Gym'}
             </h2>
             <p className="mt-2 text-center text-indigo-100">
               {success && success.includes('was rejected') 
                 ? 'Update your gym details and resubmit for approval'
                 : 'Add your gym to our platform and start attracting members'
               }
             </p>
          </div>

          {/* Form */}
          <div className="px-6 py-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Success</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>{success}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Gym Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors ${
                    errors.name 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                  placeholder="Enter your gym name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors ${
                    errors.address 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                  placeholder="Enter your gym address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors ${
                      errors.phone 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                    placeholder="Enter 10-digit phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors ${
                      errors.email 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                    placeholder="gym@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Describe your gym, facilities, and what makes it special..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Important Note</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Your gym registration will be reviewed by our admin team. You'll be notified once it's approved and listed on our platform.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registering...
                    </div>
                                     ) : (
                     success && success.includes('was rejected') ? 'Update Gym' : 'Register Gym'
                   )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymRegistration;
