import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Debug logging
  console.log('Navbar - User state:', user);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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

  const getUserTypeColor = (userType) => {
    switch (userType) {
      case 'admin':
        return 'bg-slate-100 text-slate-700 ring-slate-700/10';
      case 'gym_owner':
        return 'bg-slate-100 text-slate-700 ring-slate-700/10';
      case 'member':
        return 'bg-slate-100 text-slate-700 ring-slate-700/10';
      default:
        return 'bg-slate-100 text-slate-700 ring-slate-700/10';
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            {/* Logo */}
            <div className="flex flex-shrink-0 items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-gray-900">FitNexus</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/gyms"
                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-600 hover:border-slate-800 hover:text-gray-900"
              >
                Browse Gyms
              </Link>
              
              {user && (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-600 hover:border-slate-800 hover:text-gray-900"
                >
                  Dashboard
                </Link>
              )}

              {user?.user_type === 'gym_owner' && (
                <>
                  <Link
                    to="/gym-registration"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-600 hover:border-slate-800 hover:text-gray-900"
                  >
                    Register Gym
                  </Link>
                  <Link
                    to="/gym-management"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-600 hover:border-slate-800 hover:text-gray-900"
                  >
                    Manage Gym
                  </Link>
                  <Link
                    to="/membership-requests"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-600 hover:border-slate-800 hover:text-gray-900"
                  >
                    Requests
                  </Link>
                </>
              )}

              {user?.user_type === 'admin' && (
                <Link
                  to="/admin/gym-approvals"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-600 hover:border-slate-800 hover:text-gray-900"
                >
                  Gym Approvals
                </Link>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* User info */}
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getUserTypeColor(user?.user_type)}`}>
                      {getUserTypeDisplay(user?.user_type || '')}
                    </span>
                  </div>
                </div>

                {/* Profile and Logout buttons */}
                <Link
                  to="/profile"
                  className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 border border-slate-300 hover:bg-slate-200 transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-800"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 pb-3 pt-2">
            <Link
              to="/gyms"
              className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:border-slate-800 hover:bg-gray-50 hover:text-gray-900"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Gyms
            </Link>
            
            {user && (
              <Link
                to="/dashboard"
                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:border-slate-800 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}

            {user?.user_type === 'gym_owner' && (
              <>
                <Link
                  to="/gym-registration"
                  className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:border-slate-800 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register Gym
                </Link>
                <Link
                  to="/gym-management"
                  className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:border-slate-800 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Manage Gym
                </Link>
                <Link
                  to="/membership-requests"
                  className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:border-slate-800 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Membership Requests
                </Link>
              </>
            )}

            {user?.user_type === 'admin' && (
              <Link
                to="/admin/gym-approvals"
                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:border-slate-800 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Gym Approvals
              </Link>
            )}
          </div>

          {user ? (
            <div className="border-t border-gray-200 pb-3 pt-4">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user?.first_name} {user?.last_name}</div>
                  <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getUserTypeColor(user?.user_type)}`}>
                    {getUserTypeDisplay(user?.user_type || '')}
                  </span>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-200 pb-3 pt-4">
                          <div className="space-y-1">
              <Link
                to="/login"
                className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Get started
              </Link>
            </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
