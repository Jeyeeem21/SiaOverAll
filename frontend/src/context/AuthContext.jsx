import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const initAuth = async () => {
      try {
        if (ApiService.isAuthenticated()) {
          // Fetch user profile to validate token
          const profile = await ApiService.getProfile();
          setUser({
            id: profile.id,
            name: profile.full_name || profile.name,
            email: profile.email,
            role: 'student', // Always student for this system
            phone: profile.phone || profile.contact_number,
            student_number: profile.student_number,
            reference_no: profile.reference_no,
            college: profile.college,
            department: profile.department,
            contact_number: profile.contact_number,
            status: profile.student_status || profile.status,
            user_status: profile.status,
            email_verified: profile.email_verified,
            verified_at: profile.verified_at,
            verified_by: profile.verified_by
          });
        }
      } catch (err) {
        // Token might be invalid, clear it
        ApiService.removeAuthToken();
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.login(email, password);
      
      // Set basic user data first from login response
      setUser({
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role
      });
      
      // Immediately fetch full profile to ensure complete user data
      try {
        const profile = await ApiService.getProfile();
        setUser({
          id: profile.id,
          name: profile.full_name || profile.name,
          email: profile.email,
          role: response.user.role, // Keep the role from login (student mapping)
          phone: profile.phone || profile.contact_number,
          student_number: profile.student_number,
          reference_no: profile.reference_no,
          college: profile.college,
          department: profile.department,
          contact_number: profile.contact_number,
          status: profile.student_status || profile.status,
          user_status: profile.status,
          email_verified: profile.email_verified,
          verified_at: profile.verified_at,
          verified_by: profile.verified_by
        });
      } catch (profileErr) {
        // Profile fetch failed, but login was successful, so keep basic user data
        console.warn('Profile fetch failed after login:', profileErr);
      }
      
      setLoading(false); // Set loading false before returning
      return { success: true, data: response };
    } catch (err) {
      setLoading(false); // Set loading false on error too
      setError(err.message);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.register(userData);
      
      setUser({
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role
      });
      
      return { success: true, data: response };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    ApiService.logout();
    setUser(null);
    setError(null);
  };

  const getMe = async () => {
    try {
      const profile = await ApiService.getProfile();
      setUser({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role || 'student',
        phone: profile.phone || profile.contact_number, // Use phone field primarily
        student_number: profile.student_number,
        reference_no: profile.reference_no,
        college: profile.college,
        department: profile.department,
        contact_number: profile.contact_number, // Keep for backward compatibility
        status: profile.student_status || profile.status, // Student verification status
        user_status: profile.status, // User account status  
        email_verified: profile.email_verified,
        verified_at: profile.verified_at,
        verified_by: profile.verified_by
      });
      return profile;
    } catch (error) {
      console.error('Fetch user error:', error);
      return null;
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    getMe,
    isAuthenticated: !!user,
    USE_MOCK: false // Now using real API
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};