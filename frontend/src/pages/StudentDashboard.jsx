import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';

const StudentDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <>
      <Navigation userRole="student" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <header className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="text-left">
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome, {user?.name || 'Student'}!
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Student Account System Dashboard
                </p>
              </div>

              <div className="flex items-center space-x-4 md:hidden">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.email}</span>
                </div>
                <button
                  onClick={logout}
                  className="btn-secondary btn-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
      <main className="mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {/* Success Message */}
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-green-800">🎉 Login Successful!</h3>
                <p className="text-green-700">You have successfully logged in to the redesigned Student Account System.</p>
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="card mb-8 animate-slide-up">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{user?.name || 'Test User'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email Address</label>
                  <p className="mt-1 text-sm text-gray-900">{user?.email || 'test@example.com'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">User Role</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{user?.role || 'Student'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </>
  );
};

export default StudentDashboard;