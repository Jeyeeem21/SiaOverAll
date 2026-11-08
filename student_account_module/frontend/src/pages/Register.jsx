import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api';
import { validateFile } from '../utils/helpers';

// Docker's Vite watcher polls this file so registration UI changes hot-reload on Windows.
const isEmailFormat = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
  const [toast, setToast] = useState(null);
  const [emailStatus, setEmailStatus] = useState('idle');
  const [studentNumberStatus, setStudentNumberStatus] = useState('idle');

  useEffect(() => {
    if (!toast || toast.type === 'success') {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const email = formData.email.trim().toLowerCase();

    if (!email) {
      setEmailStatus('idle');
      return undefined;
    }

    if (!isEmailFormat(email)) {
      setEmailStatus('invalid');
      return undefined;
    }

    setEmailStatus('checking');
    const timer = window.setTimeout(async () => {
      try {
        const result = await ApiService.checkEmail(email);
        setEmailStatus(result.available ? 'available' : 'taken');
        if (!result.available) {
          setErrors((current) => ({ ...current, email: ['This email is already registered.'] }));
        }
      } catch {
        // Registration still performs the final server-side uniqueness check.
        setEmailStatus('idle');
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [formData.email]);

  useEffect(() => {
    const studentNumber = formData.student_number.trim();

    if (!studentNumber) {
      setStudentNumberStatus('idle');
      return undefined;
    }

    setStudentNumberStatus('checking');
    const timer = window.setTimeout(async () => {
      try {
        const result = await ApiService.checkStudentNumber(studentNumber);
        setStudentNumberStatus(result.available ? 'available' : 'taken');
        if (!result.available) {
          setErrors((current) => ({ ...current, student_number: ['This student number is already registered.'] }));
        }
      } catch {
        // The registration endpoint repeats this check before saving data.
        setStudentNumberStatus('idle');
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [formData.student_number]);

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

    if (emailStatus === 'taken') {
      setErrors((current) => ({ ...current, email: ['This email is already registered.'] }));
      setToast({ type: 'error', message: 'Use a different email address.' });
      return;
    }

    if (emailStatus === 'checking') {
      setErrors((current) => ({ ...current, email: ['Please wait while we check your email address.'] }));
      return;
    }

    if (studentNumberStatus === 'taken') {
      setErrors((current) => ({ ...current, student_number: ['This student number is already registered.'] }));
      setToast({ type: 'error', message: 'Use a different student number.' });
      return;
    }

    if (studentNumberStatus === 'checking') {
      setErrors((current) => ({ ...current, student_number: ['Please wait while we check your student number.'] }));
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await register({
        ...formData,
        contact_number: formData.phone,
      });
      
      setToast({
        type: 'success',
        message: 'Registration successful! Redirecting to the main system login page…',
      });

      // Let the user read the confirmation before redirecting.
      window.setTimeout(() => {
        window.location.href = `${import.meta.env.VITE_MAIN_SYSTEM_URL}/login`;
      }, 2200);
    } catch (error) {
      if (error.data) {
        // Handle validation errors
        const validationErrors = error.data.errors || error.data;
        if (Object.values(validationErrors).some(Array.isArray)) {
          setErrors(validationErrors);
        } else {
          // Handle general error
          setErrors({ general: error.data.message || error.data.error || 'Registration failed' });
        }
      } else {
        setErrors({ general: error.message || 'Registration failed' });
      }
      setToast({ type: 'error', message: error.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {toast && (
        <div
          aria-live="polite"
          className={`fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-md items-start gap-3 rounded-lg border p-4 shadow-lg sm:right-6 sm:top-6 ${
            toast.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-900'
              : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? '✓' : '!'}
          </span>
          <p className="flex-1 text-sm font-medium leading-6">{toast.message}</p>
          {toast.type === 'error' && (
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setToast(null)}
              className="text-lg leading-none opacity-70 hover:opacity-100"
            >
              ×
            </button>
          )}
        </div>
      )}
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
              onInput={handleChange}
              onBlur={handleChange}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
            {emailStatus === 'checking' && (
              <p className="mt-1 text-sm text-gray-500">Checking email availability...</p>
            )}
            {emailStatus === 'available' && !errors.email && (
              <p className="mt-1 text-sm text-green-600">Email is available.</p>
            )}
            {emailStatus === 'invalid' && (
              <p className="mt-1 text-sm text-red-600">Enter a valid email address.</p>
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
              onInput={handleChange}
              onBlur={handleChange}
            />
            {errors.student_number && (
              <p className="mt-1 text-sm text-red-600">{errors.student_number}</p>
            )}
            {studentNumberStatus === 'checking' && (
              <p className="mt-1 text-sm text-gray-500">Checking student number availability...</p>
            )}
            {studentNumberStatus === 'available' && !errors.student_number && (
              <p className="mt-1 text-sm text-green-600">Student number is available.</p>
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
            href={`${import.meta.env.VITE_MAIN_SYSTEM_URL}/login`}
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
