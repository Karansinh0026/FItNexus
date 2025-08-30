import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import DashboardLayout from './components/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GymList from './pages/GymList';
import GymDetail from './pages/GymDetail';
import GymRegistration from './pages/GymRegistration';
import GymManagement from './pages/GymManagement';
import MembershipRequests from './pages/MembershipRequests';
import AdminGymApprovals from './pages/AdminGymApprovals';
import AdminManageGyms from './pages/AdminManageGyms';
import MembershipManagement from './pages/MembershipManagement';
import Profile from './pages/Profile';
import MemberAttendance from './pages/MemberAttendance';
import GymAttendanceAnalytics from './pages/GymAttendanceAnalytics';
import NoticeBoard from './pages/NoticeBoard';
import ExerciseRoutine from './pages/ExerciseRoutine';



// Private Route component
const PrivateRoute = ({ children, allowedUserTypes = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-slate-900 shadow-sm">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(user?.user_type)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Home component
const Home = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return <Landing />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50">
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<div><Navbar /><Login /></div>} />
              <Route path="/register" element={<div><Navbar /><Register /></div>} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route 
                path="/gyms" 
                element={
                  <PrivateRoute allowedUserTypes={['admin', 'member']}>
                    <DashboardLayout>
                      <GymList />
                    </DashboardLayout>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/gyms/:id" 
                element={
                  <PrivateRoute allowedUserTypes={['admin', 'member']}>
                    <DashboardLayout>
                      <GymDetail />
                    </DashboardLayout>
                  </PrivateRoute>
                } 
              />
              <Route
                path="/gym-registration"
                element={
                  <PrivateRoute allowedUserTypes={['gym_owner']}>
                    <DashboardLayout>
                      <GymRegistration />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/gym-management"
                element={
                  <PrivateRoute allowedUserTypes={['gym_owner']}>
                    <DashboardLayout>
                      <GymManagement />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/membership-requests"
                element={
                  <PrivateRoute allowedUserTypes={['gym_owner']}>
                    <DashboardLayout>
                      <MembershipRequests />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/gym-approvals"
                element={
                  <PrivateRoute allowedUserTypes={['admin']}>
                    <DashboardLayout>
                      <AdminGymApprovals />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/manage-gyms"
                element={
                  <PrivateRoute allowedUserTypes={['admin']}>
                    <DashboardLayout>
                      <AdminManageGyms />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
                    <Route
                        path="/my-memberships"
                        element={
                          <PrivateRoute allowedUserTypes={['member']}>
                            <DashboardLayout>
                              <MembershipManagement />
                            </DashboardLayout>
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <PrivateRoute allowedUserTypes={['member', 'gym_owner', 'admin']}>
                            <DashboardLayout>
                              <Profile />
                            </DashboardLayout>
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/notice-board"
                        element={
                          <PrivateRoute allowedUserTypes={['gym_owner', 'member', 'admin']}>
                            <DashboardLayout>
                              <NoticeBoard />
                            </DashboardLayout>
                          </PrivateRoute>
                        }
                      />

                      {/* Exercise Routine Routes */}
                      <Route
                        path="/exercise-routines"
                        element={
                          <PrivateRoute allowedUserTypes={['member']}>
                            <DashboardLayout>
                              <ExerciseRoutine />
                            </DashboardLayout>
                          </PrivateRoute>
                        }
                      />

              {/* Attendance Routes */}
              <Route
                path="/gyms/:gymId/attendance"
                element={
                  <PrivateRoute allowedUserTypes={['member']}>
                    <DashboardLayout>
                      <MemberAttendance />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              
              <Route
                path="/gyms/:gymId/analytics"
                element={
                  <PrivateRoute allowedUserTypes={['gym_owner']}>
                    <DashboardLayout>
                      <GymAttendanceAnalytics />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
