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
          className={`fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-md items-start gap-3 rounded-xl border p-4 shadow-lg sm:right-6 sm:top-6 ${
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-rose-200 bg-rose-50 text-rose-900'
          }`}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}
          >
            {toast.type === 'success' ? '✓' : '!'}
          </span>
          <p className="flex-1 text-[13px] font-medium leading-6">{toast.message}</p>
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
      <div className="w-full bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100 p-8 space-y-6 max-w-4xl">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-50 mb-4">
            <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Create Account</h2>
          <p className="text-[11px] text-gray-500 mt-1">Register to access MinSU services</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Two Column Grid for Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="block w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Juan Dela Cruz"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <p className="mt-1.5 text-[11px] text-rose-600">{errors.name}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="student@minsu.edu.ph"
                value={formData.email}
                onChange={handleChange}
                onInput={handleChange}
                onBlur={handleChange}
              />
              {errors.email && (
                <p className="mt-1.5 text-[11px] text-rose-600">{errors.email}</p>
              )}
              {emailStatus === 'checking' && (
                <p className="mt-1.5 text-[11px] text-gray-500">Checking email availability...</p>
              )}
              {emailStatus === 'available' && !errors.email && (
                <p className="mt-1.5 text-[11px] text-emerald-600">✓ Email is available</p>
              )}
              {emailStatus === 'invalid' && (
                <p className="mt-1.5 text-[11px] text-rose-600">Enter a valid email address</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="block w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="mt-1.5 text-[11px] text-rose-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="password_confirmation" className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                required
                className="block w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Re-enter password"
                value={formData.password_confirmation}
                onChange={handleChange}
              />
              {errors.password_confirmation && (
                <p className="mt-1.5 text-[11px] text-rose-600">{errors.password_confirmation}</p>
              )}
            </div>

            {/* Student Number */}
            <div>
              <label htmlFor="student_number" className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                Student Number
              </label>
              <input
                id="student_number"
                name="student_number"
                type="text"
                required
                className="block w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="2024-00001"
                value={formData.student_number}
                onChange={handleChange}
                onInput={handleChange}
                onBlur={handleChange}
              />
              {errors.student_number && (
                <p className="mt-1.5 text-[11px] text-rose-600">{errors.student_number}</p>
              )}
              {studentNumberStatus === 'checking' && (
                <p className="mt-1.5 text-[11px] text-gray-500">Checking student number availability...</p>
              )}
              {studentNumberStatus === 'available' && !errors.student_number && (
                <p className="mt-1.5 text-[11px] text-emerald-600">✓ Student number is available</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="block w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="09XX XXX XXXX"
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && (
                <p className="mt-1.5 text-[11px] text-rose-600">{errors.phone}</p>
              )}
            </div>

            {/* College */}
            <div>
              <label htmlFor="college" className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                College
              </label>
              <input
                id="college"
                name="college"
                type="text"
                required
                className="block w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="e.g., College of Engineering"
                value={formData.college}
                onChange={handleChange}
              />
              {errors.college && (
                <p className="mt-1.5 text-[11px] text-rose-600">{errors.college}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label htmlFor="department" className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                Department
              </label>
              <input
                id="department"
                name="department"
                type="text"
                required
                className="block w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="e.g., Computer Science"
                value={formData.department}
                onChange={handleChange}
              />
              {errors.department && (
                <p className="mt-1.5 text-[11px] text-rose-600">{errors.department}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl text-[13px] font-semibold hover:bg-emerald-700 active:scale-[0.98] focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-[11px] text-gray-600">
            Already have an account?{' '}
            <a
              href={`${import.meta.env.VITE_MAIN_SYSTEM_URL}/login`}
              className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-6 text-[11px] text-gray-400">
        © {new Date().getFullYear()} Student Account System. All rights reserved.
      </p>
    </div>
  );
};

export default Register;
