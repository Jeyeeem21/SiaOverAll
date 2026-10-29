import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useStudent } from '../contexts/StudentContext';
import './OrderList.css';

function OrderList({ onViewOrder, refreshTrigger }) {
  const { student } = useStudent();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
  });

  useEffect(() => {
    if (student?.student_email) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [filters, refreshTrigger, student]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Loading orders with filters:', filters);
      const queryFilters = {
        ...filters,
        student_email: student.student_email, // Always filter by authenticated student email
      };
      const result = await api.getOrders(queryFilters);
      console.log('API Response:', result);
      
      if (result.success) {
        const ordersData = result.data.data || [];
        console.log('Orders received:', ordersData.length);
        setOrders(ordersData);
      } else {
        const errorMsg = result.message || 'Failed to load orders';
        setError(errorMsg);
        console.error('API returned error:', errorMsg);
      }
    } catch (err) {
      const errorMsg = `Error loading orders: ${err.message}`;
      setError(errorMsg);
      console.error('Exception occurred:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      submitted: 'badge-info',
      reviewing: 'badge-warning',
      awaiting_payment: 'badge-warning',
      payment_confirmed: 'badge-success',
      printing: 'badge-primary',
      ready_for_pickup: 'badge-success',
      completed: 'badge-secondary',
      cancelled: 'badge-danger',
    };

    return (
      <span className={`status-badge ${statusClasses[status] || 'badge-default'}`}>
        {status.replace(/_/g, ' ').toUpperCase()}
      </span>
    );
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Show message if no student context available
  if (!student) {
    return (
      <div className="order-list">
        <div className="email-login-container">
          <h2>📋 My Print Orders</h2>
          <p>Enter your email to view your orders</p>
          
          {error && <div className="alert alert-error">{error}</div>}
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const name = e.target.name.value || email.split('@')[0];
            // Set student context for testing
            window.location.href = `${window.location.pathname}?student_email=${encodeURIComponent(email)}&student_name=${encodeURIComponent(name)}`;
          }} className="email-login-form">
            <input
              type="email"
              name="email"
              placeholder="your.email@example.com"
              required
              autoFocus
            />
            <input
              type="text"
              name="name"
              placeholder="Your Name (optional)"
            />
            <button type="submit" className="btn btn-primary">
              View My Orders →
            </button>
          </form>
          
          <div className="info-note">
            💡 <strong>Testing Mode:</strong> This login will be replaced by parent system authentication when integrated.
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="order-list">
      <div className="order-list-header">
        <div>
          <h2>My Print Orders</h2>
          <p className="student-email">📧 {student.student_email}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="reviewing">Reviewing</option>
            <option value="awaiting_payment">Awaiting Payment</option>
            <option value="payment_confirmed">Payment Confirmed</option>
            <option value="printing">Printing</option>
            <option value="ready_for_pickup">Ready for Pickup</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>📭 No orders found</p>
          <p>Create your first print order to get started!</p>
        </div>
      ) : (
        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Student</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.print_order_id}>
                  <td><strong>{order.order_number}</strong></td>
                  <td>
                    <div>{order.student_name}</div>
                    <small>{order.student_email}</small>
                  </td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                    <span className={`payment-badge ${order.payment_status === 'paid' ? 'paid' : 'pending'}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td>₱{order.total_amount}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-small btn-view"
                      onClick={() => onViewOrder(order.print_order_id)}
                    >
                      👁️ View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default OrderList;
