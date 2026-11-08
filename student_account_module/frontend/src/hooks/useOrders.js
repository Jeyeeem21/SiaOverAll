import { useState, useEffect, useCallback } from 'react';
import OrderService from '../services/orderService';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for managing order state
 */
export const useOrders = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    totalSpent: 0,
    pendingPayments: 0
  });

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) {
      // Don't fetch orders if not authenticated
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const ordersData = await OrderService.getMyOrders();
      setOrders(ordersData);
      
      // Calculate stats
      const stats = await OrderService.getOrderStats();
      setOrderStats(stats);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Create new order
  const createOrder = useCallback(async (orderData) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to create orders');
    }

    setError(null);
    
    // Validate order data
    const validation = OrderService.validateOrderData(orderData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    try {
      const response = await OrderService.createProductOrder(orderData);
      
      // Refresh orders list
      await fetchOrders();
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchOrders, isAuthenticated]);

  // Update order
  const updateOrder = useCallback(async (orderId, updateData) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to update orders');
    }

    setError(null);
    
    try {
      const response = await OrderService.updateOrder(orderId, updateData);
      
      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, ...updateData } : order
        )
      );
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [isAuthenticated]);

  // Cancel order
  const cancelOrder = useCallback(async (orderId, reason) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to cancel orders');
    }

    setError(null);
    
    try {
      const response = await OrderService.cancelOrder(orderId, reason);
      
      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId 
            ? { ...order, status: 'cancelled', cancelled_reason: reason }
            : order
        )
      );
      
      // Update stats
      const stats = await OrderService.getOrderStats();
      setOrderStats(stats);
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [isAuthenticated]);

  // Get order by ID
  const getOrder = useCallback(async (orderId) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to view order details');
    }

    setError(null);
    
    try {
      return await OrderService.getOrder(orderId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [isAuthenticated]);

  // Filter orders by status
  const getOrdersByStatus = useCallback((status) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  // Filter orders by payment status
  const getOrdersByPaymentStatus = useCallback((paymentStatus) => {
    return orders.filter(order => order.payment_status === paymentStatus);
  }, [orders]);

  // Get recent orders (last 5)
  const getRecentOrders = useCallback(() => {
    return orders
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  }, [orders]);

  // Check if user has pending orders
  const hasPendingOrders = useCallback(() => {
    return orders.some(order => 
      order.status === 'pending' || order.status === 'processing'
    );
  }, [orders]);

  // Check if user has unpaid orders
  const hasUnpaidOrders = useCallback(() => {
    return orders.some(order => 
      order.payment_status === 'unpaid' && order.status !== 'cancelled'
    );
  }, [orders]);

  // Refresh orders
  const refreshOrders = useCallback(() => {
    return fetchOrders();
  }, [fetchOrders]);

  // Initialize - fetch orders on mount only if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [fetchOrders, isAuthenticated]);

  return {
    // State
    orders,
    loading,
    error,
    orderStats,
    
    // Actions
    createOrder,
    updateOrder,
    cancelOrder,
    getOrder,
    refreshOrders,
    
    // Computed values
    getOrdersByStatus,
    getOrdersByPaymentStatus,
    getRecentOrders,
    hasPendingOrders,
    hasUnpaidOrders,
    
    // Utility functions
    formatOrder: OrderService.formatOrder,
    getStatusInfo: OrderService.getStatusInfo,
    getPaymentStatusInfo: OrderService.getPaymentStatusInfo,
    validateOrderData: OrderService.validateOrderData,
    calculateOrderTotals: OrderService.calculateOrderTotals
  };
};

/**
 * Custom hook for a single order
 */
export const useOrder = (orderId) => {
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId || !isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const orderData = await OrderService.getOrder(orderId);
      setOrder(orderData);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch order:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId, isAuthenticated]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    loading,
    error,
    refreshOrder: fetchOrder
  };
};