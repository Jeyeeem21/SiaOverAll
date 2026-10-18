import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { validateFile } from '../utils/helpers';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    student_number: '',
    college: '',
    department: '',
    phone: '',
  });

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
      await register(formData);
      // Redirect to login after successful registration
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.data) {
        // Handle validation errors
        if (error.response.data.errors) {
          setErrors(error.response.data.errors);
        } else {
          // Handle general error
          setErrors({ general: error.response.data.message || 'Registration failed' });
        }
      } else {
        setErrors({ general: error.message || 'Registration failed' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full bg-white rounded-lg shadow-md p-8 space-y-6 max-w-md">
        <div className="flex items-center justify-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={formData.password_confirmation}
              onChange={handleChange}
            />
            {errors.password_confirmation && (
              <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
            )}
          </div>

          <div>
            <label htmlFor="student_number" className="block text-sm font-medium text-gray-700 mb-1">
              Student Number
            </label>
            <input
              id="student_number"
              name="student_number"
              type="text"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={formData.student_number}
              onChange={handleChange}
            />
            {errors.student_number && (
              <p className="mt-1 text-sm text-red-600">{errors.student_number}</p>
            )}
          </div>

          <div>
            <label htmlFor="college" className="block text-sm font-medium text-gray-700 mb-1">
              College
            </label>
            <input
              id="college"
              name="college"
              type="text"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={formData.college}
              onChange={handleChange}
            />
            {errors.college && (
              <p className="mt-1 text-sm text-red-600">{errors.college}</p>
            )}
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input
              id="department"
              name="department"
              type="text"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={formData.department}
              onChange={handleChange}
            />
            {errors.department && (
              <p className="mt-1 text-sm text-red-600">{errors.department}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={formData.phone}
              onChange={handleChange}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </div>
        </form>

        <p className="mt-4 text-sm text-gray-500">
          Already have an account?{' '}
          <a
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign in here
          </a>
        </p>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        © {new Date().getFullYear()} Student Account System. All rights reserved.
      </p>
    </div>
  );
};

export default Register;