import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const NoticeBoard = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [userGym, setUserGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const promises = [axios.get('/notices/')];
      
      // If user is a gym owner, fetch their gym information
      if (user?.user_type === 'gym_owner') {
        promises.push(axios.get('/gyms/my/'));
      }
      
      const responses = await Promise.all(promises);
      setNotices(responses[0].data);
      
      if (user?.user_type === 'gym_owner' && responses[1]?.data?.length > 0) {
        setUserGym(responses[1].data[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (editingNotice) {
        await axios.put(`/notices/${editingNotice.id}/`, formData);
        setEditingNotice(null);
      } else {
        await axios.post('/notices/create/', formData);
      }
      setFormData({ title: '', message: '' });
      setErrors({});
      setShowCreateForm(false);
      fetchData();
    } catch (error) {
      console.error('Error saving notice:', error);
      alert('Error saving notice. Please try again.');
    }
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      message: notice.message
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (noticeId) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await axios.delete(`/notices/${noticeId}/`);
        fetchData();
      } catch (error) {
        console.error('Error deleting notice:', error);
        alert('Error deleting notice. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingNotice(null);
    setFormData({ title: '', message: '' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-slate-900 shadow-sm">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading notices...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Notice Board</h3>
              <p className="mt-1 text-sm text-gray-600">Manage notices for your gym members.</p>
            </div>
            {user?.user_type === 'gym_owner' && userGym && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors duration-200"
              >
                <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Notice
              </button>
            )}
            {user?.user_type === 'gym_owner' && !userGym && (
              <div className="text-sm text-gray-500">
                You need to register a gym first to create notices
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-6 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900">
              {editingNotice ? 'Edit Notice' : 'Create New Notice'}
            </h4>
          </div>
          <div className="p-6">
            {userGym && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-sm font-medium text-blue-900">
                    Creating notice for: <span className="font-semibold">{userGym.name}</span>
                  </span>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (errors.title) {
                      setErrors({ ...errors, title: '' });
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.title 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter notice title"
                  required
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value });
                    if (errors.message) {
                      setErrors({ ...errors, message: '' });
                    }
                  }}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.message 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter notice message"
                  required
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  {editingNotice ? 'Update Notice' : 'Create Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notices List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-6 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">Recent Notices</h4>
        </div>
        <div className="p-6">
          {notices.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5v9m7.5-5.25h-15" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notices yet</h3>
              <p className="text-gray-600 mb-6">
                {user?.user_type === 'gym_owner' 
                  ? 'Create your first notice to keep your members informed.'
                  : 'No notices have been posted by your gyms yet.'
                }
              </p>
              {user?.user_type === 'gym_owner' && userGym && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors duration-200"
                >
                  Create First Notice
                </button>
              )}
              {user?.user_type === 'gym_owner' && !userGym && (
                <p className="text-sm text-gray-500">
                  Register a gym first to start creating notices
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {notices.map((notice) => (
                <div key={notice.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{notice.title}</h4>
                          <p className="text-sm text-gray-600">{notice.gym_name}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{notice.message}</p>
                      <p className="text-sm text-gray-500">
                        Posted on {notice.created_at_formatted}
                      </p>
                    </div>
                    {user?.user_type === 'gym_owner' && (
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(notice)}
                          className="inline-flex items-center rounded-lg bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(notice.id)}
                          className="inline-flex items-center rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticeBoard;
