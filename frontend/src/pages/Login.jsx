import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error) {
      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          setErrors(error.response.data.errors);
        } else {
          setErrors({ general: error.response.data.message || 'Login failed' });
        }
      } else {
        setErrors({ general: error.message || 'Login failed' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Simple SVG Icons (inline)
  const UserIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const LockIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  const EyeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
    </svg>
  );

  const AlertIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
      
      <div className="relative w-full max-w-md animate-fade-in">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl mb-4 shadow-lg transform hover:scale-105 transition-transform duration-200">
            <UserIcon />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-heading">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-sm">
            Sign in to your Student Account System
          </p>
        </div>

        {/* Main Card */}
        <div className="card p-8 backdrop-blur-sm bg-white/90 animate-slide-up">
          {/* Development Notice */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Development Mode</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Using mock authentication. Any email/password will work for testing.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <UserIcon />
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={`input pl-4 pr-4 py-3 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <AlertIcon />
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1 animate-slide-up">
                  <AlertIcon />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <LockIcon />
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className={`input pl-4 pr-12 py-3 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1 animate-slide-up">
                  <AlertIcon />
                  {errors.password}
                </p>
              )}
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 animate-slide-up">
                <AlertIcon />
                <p className="text-sm text-red-800">{errors.general}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn-lg w-full relative overflow-hidden transform hover:scale-105 transition-all duration-200"
            >
              {loading && (
                <div className="absolute inset-0 bg-blue-700 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                </div>
              )}
              <span className={loading ? 'opacity-0' : 'opacity-100'}>
                Sign In
              </span>
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New to the system?</span>
              </div>
            </div>

            {/* Register Link */}
            <Link 
              to="/register"
              className="btn-secondary btn-lg w-full group transform hover:scale-105 transition-all duration-200"
            >
              <span className="group-hover:text-blue-600 transition-colors">
                Create Account
              </span>
            </Link>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Student Account System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;