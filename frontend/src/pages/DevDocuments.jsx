import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { useAuth } from '../context/AuthContext';

const DevDocuments = () => {
  const { isAuthenticated } = useAuth();

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-md p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h3>
            <p className="text-gray-600 mb-6">
              Please log in to access documents.
            </p>
            <div className="space-y-3">
              <a
                href="/dev/login"
                className="w-full block px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login to Continue
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation userRole="student" />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
        
        <main className="pt-6 sm:pt-8 main-content">
          <div className="container-responsive space-responsive">
            {/* Page Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Documents</h1>
              <p className="text-lg text-gray-600">Document verification is now available in Profile</p>
            </div>

            {/* Redirect to Profile */}
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 mx-auto mb-6 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Document Verification</h2>
                <p className="text-gray-600 mb-6">
                  Upload and manage your verification documents directly from your profile page.
                </p>
                <div className="space-y-3">
                  <a
                    href="/dev/profile"
                    className="w-full block px-6 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Go to Profile
                  </a>
                  <p className="text-sm text-gray-500">
                    You can upload ID cards, certificates, and other verification documents.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default DevDocuments;