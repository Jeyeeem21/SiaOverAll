import { useState, useEffect } from 'react';
import ApiService from '../services/api';

export const useStudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(err.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && ApiService.isAuthenticated()) {
      fetchProfile();
    } else {
      setLoading(false);
      setProfile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { profile, loading, error, refetch: fetchProfile };
};

export const useStudentDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ApiService.isAuthenticated()) {
      fetchDocuments();
    } else {
      setLoading(false);
    }
  }, []);

  const uploadDocument = async (formData) => {
    try {
      const result = await ApiService.uploadDocument(formData);
      await fetchDocuments(); // Refresh the list
      return result;
    } catch (err) {
      throw err;
    }
  };

  return { documents, loading, error, uploadDocument, refetch: fetchDocuments };
};

export const useStudentOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Use /orders (new endpoint) for accurate data
      const data = await ApiService.getUserOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ApiService.isAuthenticated()) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, []);

  return { orders, loading, error, refetch: fetchOrders };
};

export const useStudentStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel for accuracy
      const [profileData, ordersData, docsData] = await Promise.allSettled([
        ApiService.getProfile(),
        ApiService.getUserOrders(),
        ApiService.getDocuments(),
      ]);

      const profile = profileData.status === 'fulfilled' ? profileData.value : null;
      const orders  = ordersData.status  === 'fulfilled' ? (Array.isArray(ordersData.value)  ? ordersData.value  : []) : [];
      const docs    = docsData.status    === 'fulfilled' ? (Array.isArray(docsData.value)    ? docsData.value    : []) : [];

      // Compute stats from real data
      const totalSpent = orders
        .filter(o => o.payment_status === 'paid')
        .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

      const pendingPayments = orders
        .filter(o => o.payment_status === 'unpaid' && o.status !== 'cancelled')
        .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

      const studentStatus = profile?.student_status || 'pending';
      const emailVerified = profile?.email_verified;
      const accountCompletion = studentStatus === 'approved' && emailVerified ? 100
        : studentStatus === 'approved' ? 85
        : docs.length > 0 ? 70
        : 50;

      setStats({
        documents_count:      docs.length,
        student_status:       studentStatus,
        user_status:          profile?.status || 'active',
        email_verified:       emailVerified,
        orders_count:         orders.length,
        total_spent:          totalSpent,
        pending_payments:     pendingPayments,
        notifications_count:  0,
        account_completion:   accountCompletion,
        verified_at:          profile?.verified_at,
        last_activity:        new Date().toISOString(),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ApiService.isAuthenticated()) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};

export const useStudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getNotifications();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await ApiService.markNotificationRead(notificationId);
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  useEffect(() => {
    if (ApiService.isAuthenticated()) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, []);

  return { 
    notifications, 
    loading, 
    error, 
    markAsRead,
    refetch: fetchNotifications,
    unreadCount: notifications.filter(n => !n.is_read).length
  };
};