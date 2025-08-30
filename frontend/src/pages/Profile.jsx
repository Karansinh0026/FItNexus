import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    Object.keys(profileForm).forEach(field => {
      if (field !== 'address') { // address is optional
        const fieldError = validateField(field, profileForm[field]);
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
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/profile/update/', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileForm)
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        updateUser(updatedUser);
        alert('Profile updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to update profile'}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name, value) => {
    let fieldError = '';
    
    switch (name) {
      case 'first_name':
        if (!value.trim()) {
          fieldError = 'First name is required';
        } else if (value.trim().length < 2) {
          fieldError = 'First name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          fieldError = 'First name can only contain letters and spaces';
        }
        break;
        
      case 'last_name':
        if (!value.trim()) {
          fieldError = 'Last name is required';
        } else if (value.trim().length < 2) {
          fieldError = 'Last name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          fieldError = 'Last name can only contain letters and spaces';
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          fieldError = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          fieldError = 'Please enter a valid email address';
        }
        break;
        
      case 'phone':
        if (value.trim()) {
          const phoneRegex = /^[0-9]{10}$/;
          if (!phoneRegex.test(value.trim())) {
            fieldError = 'Phone number must be exactly 10 digits';
          }
        }
        break;
        
      default:
        break;
    }
    
    return fieldError;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
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

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        {/* Header */}
        <div className="px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                Profile Settings
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Update your personal information and preferences
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="border-t border-gray-200">
          <form onSubmit={handleSubmit} className="px-4 py-6 sm:px-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  id="first_name"
                  value={profileForm.first_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.first_name 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                  required
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                )}
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  id="last_name"
                  value={profileForm.last_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.last_name 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                  required
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={profileForm.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.email 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={profileForm.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter 10-digit phone number"
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.phone 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={user.username}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Username cannot be changed</p>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  name="address"
                  id="address"
                  rows={3}
                  value={profileForm.address}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Account Type
                </label>
                <div className="mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    {user.user_type === 'admin' ? 'Admin' : 
                     user.user_type === 'gym_owner' ? 'Gym Owner' : 'Member'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">Account type cannot be changed</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  'Update Profile'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
