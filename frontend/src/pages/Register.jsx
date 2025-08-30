import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    user_type: 'member', // Default to member, no admin option
    phone_number: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

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
        
      case 'username':
        if (!value.trim()) {
          fieldError = 'Username is required';
        } else if (value.trim().length < 3) {
          fieldError = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value.trim())) {
          fieldError = 'Username can only contain letters, numbers, and underscores';
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          fieldError = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          fieldError = 'Please enter a valid email address';
        }
        break;
        
      case 'phone_number':
        if (value.trim()) {
          const phoneRegex = /^[0-9]{10}$/;
          if (!phoneRegex.test(value.trim())) {
            fieldError = 'Phone number must be exactly 10 digits';
          }
        }
        break;
        
      case 'password':
        if (!value) {
          fieldError = 'Password is required';
        } else if (value.length < 8) {
          fieldError = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])/.test(value)) {
          fieldError = 'Password must contain at least one lowercase letter';
        } else if (!/(?=.*[A-Z])/.test(value)) {
          fieldError = 'Password must contain at least one uppercase letter';
        } else if (!/(?=.*\d)/.test(value)) {
          fieldError = 'Password must contain at least one number';
        }
        break;
        
      case 'confirm_password':
        if (!value) {
          fieldError = 'Please confirm your password';
        } else if (value !== formData.password) {
          fieldError = 'Passwords do not match';
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
    
    // Validate all fields
    Object.keys(formData).forEach(field => {
      const fieldError = validateField(field, formData[field]);
      if (fieldError) {
        newErrors[field] = fieldError;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-lg bg-slate-800 flex items-center justify-center">
            <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        </div>
        <h2 className="mt-8 text-center text-2xl font-semibold leading-9 tracking-tight text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm leading-6 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-slate-700 hover:text-slate-900">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
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

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium leading-6 text-gray-900">
                First Name
              </label>
              <div className="mt-2">
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  className={`block w-full rounded-md border py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 sm:text-sm ${
                    errors.first_name 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-slate-800 focus:ring-slate-800'
                  }`}
                  value={formData.first_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium leading-6 text-gray-900">
                Last Name
              </label>
              <div className="mt-2">
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  className={`block w-full rounded-md border py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 sm:text-sm ${
                    errors.last_name 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-slate-800 focus:ring-slate-800'
                  }`}
                  value={formData.last_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
              Username
            </label>
            <div className="mt-2">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className={`block w-full rounded-md border py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 sm:text-sm ${
                  errors.username 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-slate-800 focus:ring-slate-800'
                }`}
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`block w-full rounded-md border py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 sm:text-sm ${
                  errors.email 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-slate-800 focus:ring-slate-800'
                }`}
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
            <label htmlFor="user_type" className="block text-sm font-medium leading-6 text-gray-900">
              Account Type
            </label>
            <div className="mt-2">
              <select
                id="user_type"
                name="user_type"
                required
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800 sm:text-sm"
                value={formData.user_type}
                onChange={handleChange}
              >
                <option value="member">Member</option>
                <option value="gym_owner">Gym Owner</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium leading-6 text-gray-900">
              Phone Number
            </label>
            <div className="mt-2">
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                className={`block w-full rounded-md border py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 sm:text-sm ${
                  errors.phone_number 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-slate-800 focus:ring-slate-800'
                }`}
                placeholder="Enter 10-digit phone number"
                value={formData.phone_number}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.phone_number && (
                <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900">
              Address
            </label>
            <div className="mt-2">
              <textarea
                id="address"
                name="address"
                rows={3}
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800 sm:text-sm"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={`block w-full rounded-md border py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 sm:text-sm ${
                  errors.password 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-slate-800 focus:ring-slate-800'
                }`}
                placeholder="Minimum 8 characters with uppercase, lowercase, and number"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="confirm_password" className="block text-sm font-medium leading-6 text-gray-900">
              Confirm Password
            </label>
            <div className="mt-2">
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                required
                className={`block w-full rounded-md border py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 sm:text-sm ${
                  errors.confirm_password 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-slate-800 focus:ring-slate-800'
                }`}
                placeholder="Confirm your password"
                value={formData.confirm_password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.confirm_password && (
                <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
