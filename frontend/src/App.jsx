import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import Profile from './pages/Profile';
import Verification from './pages/Verification';
import Orders from './pages/Orders';

// Dev Pages (No authentication required) - STUDENT FOCUSED ONLY
import DevLogin from './pages/DevLogin';
import DevRegister from './pages/DevRegister';
import DevDashboard from './pages/DevDashboard';
import DevVerification from './pages/DevVerification';
import DevOrders from './pages/DevOrders';
import DevProfile from './pages/DevProfile';
import DevProducts from './pages/DevProducts';
import DevDocuments from './pages/DevDocuments';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Dev Routes - STUDENT ACCOUNT & VERIFICATION SYSTEM ONLY */}
            <Route path="/dev/login" element={<DevLogin />} />
            <Route path="/dev/register" element={<DevRegister />} />
            <Route path="/dev/dashboard" element={<DevDashboard />} />
            <Route path="/dev/verification" element={<DevVerification />} />
            <Route path="/dev/orders" element={<DevOrders />} />
            <Route path="/dev/profile" element={<DevProfile />} />
            <Route path="/dev/products" element={<DevProducts />} />
            <Route path="/dev/documents" element={<DevDocuments />} />

            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              element={
                <ProtectedRoute>
                  <Routes>
                    {/* Student routes */}
                    <Route
                      path="/dashboard"
                      element={
                        <RoleBasedRoute role="student">
                          <StudentDashboard />
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <RoleBasedRoute role="student">
                          <Profile />
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="/verification"
                      element={
                        <RoleBasedRoute role="student">
                          <Verification />
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <RoleBasedRoute role="student">
                          <Orders />
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="/student/dashboard"
                      element={
                        <RoleBasedRoute role="student">
                          <StudentDashboard />
                        </RoleBasedRoute>
                      }
                    />

                    {/* Redirect to dashboard */}
                    <Route
                      path="/"
                      element={
                        <Navigate replace to="/dashboard" />
                      }
                    />
                  </Routes>
                </ProtectedRoute>
              }
            />

            {/* Default redirect to dev login for easy access */}
            <Route
              path="*"
              element={
                <Navigate replace to="/dev/login" />
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;