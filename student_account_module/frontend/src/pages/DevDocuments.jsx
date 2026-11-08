import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const DevDocuments = () => {
  const { isAuthenticated, user } = useAuth();

  // Pass student info to print module
  useEffect(() => {
    if (user && isAuthenticated) {
      // Store student context for the print module to use
      const studentData = {
        student_name: user.full_name,
        student_email: user.email,
        student_phone: user.phone,
        student_id: user.student_number,
      };
      localStorage.setItem('student_context', JSON.stringify(studentData));
      
      // Share auth token
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.setItem('auth_token', token);
      }
    }
  }, [user, isAuthenticated]);

  // Redirect to Student Print Module (port 5175 based on root compose.yaml)
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to print module instead of embedding
      window.location.href = import.meta.env.VITE_PRINT_FRONTEND_URL;
    }
  }, [isAuthenticated]);

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-md p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h3>
          <p className="text-gray-600 mb-6">
            Please log in to access print services.
          </p>
          <div className="space-y-3">
            <a
              href="/dev/login"
              className="btn-primary btn-md w-full inline-block"
            >
              Login to Continue
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
        <p className="text-gray-600">Redirecting to Print Services...</p>
      </div>
    </div>
  );
};

export default DevDocuments;
