import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './OrderDetails.css';

function OrderDetails({ orderId, onBack }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    setLoading(true);
    try {
      const result = await api.getOrder(orderId);
      if (result.success) {
        setOrder(result.data);
      } else {
        setError('Failed to load order details');
      }
    } catch (err) {
      setError('An error occurred while loading order details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    try {
      const result = await api.cancelOrder(orderId, cancelReason);
      if (result.success) {
        alert('Order cancelled successfully');
        loadOrderDetails(); // Reload to show updated status
        setShowCancelForm(false);
      } else {
        alert(result.message || 'Failed to cancel order');
      }
    } catch (err) {
      alert('An error occurred while cancelling the order');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={onBack} className="btn btn-secondary">← Back to Orders</button>
      </div>
    );
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  const getStatusColor = (status) => {
    const colors = {
      submitted: '#17a2b8',
      reviewing: '#ffc107',
      awaiting_payment: '#fd7e14',
      payment_confirmed: '#28a745',
      printing: '#007bff',
      ready_for_pickup: '#28a745',
      completed: '#6c757d',
      cancelled: '#dc3545',
    };
    return colors[status] || '#6c757d';
  };

  return (
    <div className="order-details">
      <div className="details-header">
        <button onClick={onBack} className="btn btn-back">← Back to Orders</button>
        <h2>Order Details: {order.order_number}</h2>
        <div className="status-indicator" style={{ backgroundColor: getStatusColor(order.status) }}>
          {order.status.replace(/_/g, ' ').toUpperCase()}
        </div>
      </div>

      <div className="details-grid">
        {/* Student Information */}
        <div className="details-section">
          <h3>👤 Student Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <span>{order.student_name}</span>
            </div>
            {order.student_id && (
              <div className="info-item">
                <label>Student ID:</label>
                <span>{order.student_id}</span>
              </div>
            )}
            <div className="info-item">
              <label>Email:</label>
              <span>{order.student_email}</span>
            </div>
            {order.student_phone && (
              <div className="info-item">
                <label>Phone:</label>
                <span>{order.student_phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Print Options */}
        <div className="details-section">
          <h3>🖨️ Print Options</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Color Type:</label>
              <span>{order.printing_options.color_type === 'black_white' ? 'Black & White' : 'Colored'}</span>
            </div>
            <div className="info-item">
              <label>Paper Size:</label>
              <span>{order.printing_options.paper_size}</span>
            </div>
            <div className="info-item">
              <label>Orientation:</label>
              <span>{order.printing_options.orientation}</span>
            </div>
            <div className="info-item">
              <label>Print Side:</label>
              <span>{order.printing_options.print_side === 'single' ? 'Single-sided' : 'Double-sided'}</span>
            </div>
            <div className="info-item">
              <label>Copies:</label>
              <span>{order.printing_options.copies}</span>
            </div>
            <div className="info-item">
              <label>Pages per Copy:</label>
              <span>{order.printing_options.pages_per_document}</span>
            </div>
            <div className="info-item">
              <label>Total Pages:</label>
              <span><strong>{order.printing_options.total_pages}</strong></span>
            </div>
            {order.printing_options.binding_type !== 'none' && (
              <div className="info-item">
                <label>Binding:</label>
                <span>{order.printing_options.binding_type.replace(/_/g, ' ')}</span>
              </div>
            )}
            {order.printing_options.lamination && (
              <>
                <div className="info-item">
                  <label>Lamination Item:</label>
                  <span>{order.printing_options.lamination_item || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Lamination Quantity:</label>
                  <span>{order.printing_options.lamination_quantity || 1}</span>
                </div>
                <div className="info-item">
                  <label>Lamination Type:</label>
                  <span>{order.printing_options.lamination_type}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="details-section">
          <h3>💰 Pricing Breakdown</h3>
          <div className="pricing-table">
            <div className="pricing-row">
              <span>Price per page:</span>
              <span>₱{order.pricing.price_per_page}</span>
            </div>
            <div className="pricing-row">
              <span>Total pages ({order.printing_options.total_pages}):</span>
              <span>₱{(parseFloat(order.pricing.price_per_page) * order.printing_options.total_pages).toFixed(2)}</span>
            </div>
            {parseFloat(order.pricing.binding_cost) > 0 && (
              <div className="pricing-row">
                <span>Binding:</span>
                <span>₱{order.pricing.binding_cost}</span>
              </div>
            )}
            {parseFloat(order.pricing.lamination_cost) > 0 && (
              <div className="pricing-row">
                <span>Lamination:</span>
                <span>₱{order.pricing.lamination_cost}</span>
              </div>
            )}
            <div className="pricing-row total">
              <strong>Total Amount:</strong>
              <strong>₱{order.pricing.total_amount}</strong>
            </div>
          </div>
          <div className="payment-status">
            <span>Payment Status:</span>
            <span className={`payment-badge ${order.payment_status}`}>
              {order.payment_status.toUpperCase()}
            </span>
          </div>
          <div className="payment-status">
            <span>Payment Method:</span>
            <span className="payment-method-badge">
              {order.payment_method === 'cash_on_pickup' ? '💵 Cash on Pickup' : '📤 Upload Proof'}
            </span>
          </div>
          {order.payment_proof_original_name && (
            <div className="payment-status">
              <span>Payment Proof:</span>
              <span>{order.payment_proof_original_name}</span>
            </div>
          )}
          <div className="payment-status">
            <span>Amount Paid:</span>
            <span>₱{order.amount_paid}</span>
          </div>
        </div>

        {/* Files */}
        <div className="details-section">
          <h3>📁 Uploaded Files</h3>
          <div className="files-list">
            {order.files && order.files.length > 0 ? (
              order.files.map((file) => (
                <div key={file.file_id} className="file-item">
                  <div className="file-info">
                    <span className="file-icon">📄</span>
                    <div>
                      <div className="file-name">{file.original_filename}</div>
                      <div className="file-meta">
                        {file.file_size} • {file.page_count ? `${file.page_count} pages` : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <span className={`file-status ${file.status}`}>{file.status}</span>
                </div>
              ))
            ) : (
              <p>No files available</p>
            )}
          </div>
        </div>

        {/* Status History */}
        {order.status_history && order.status_history.length > 0 && (
          <div className="details-section full-width">
            <h3>📋 Status History</h3>
            <div className="timeline">
              {order.status_history.map((history, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <strong>
                        {history.from_status ? `${history.from_status} → ` : ''}
                        {history.to_status}
                      </strong>
                      <span className="timeline-date">{new Date(history.created_at).toLocaleString()}</span>
                    </div>
                    {history.notes && <p>{history.notes}</p>}
                    {history.changed_by_name && <small>by {history.changed_by_name}</small>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Details */}
        {(order.special_instructions || order.preferred_pickup_date) && (
          <div className="details-section full-width">
            <h3>ℹ️ Additional Information</h3>
            {order.preferred_pickup_date && (
              <div className="info-item">
                <label>Preferred Pickup Date & Time:</label>
                <span>{new Date(order.preferred_pickup_date).toLocaleString()}</span>
              </div>
            )}
            {order.special_instructions && (
              <div className="info-item">
                <label>Special Instructions:</label>
                <p>{order.special_instructions}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {order.status !== 'cancelled' && order.status !== 'completed' && (
        <div className="order-actions">
          {!showCancelForm ? (
            <button 
              className="btn btn-danger" 
              onClick={() => setShowCancelForm(true)}
            >
              ❌ Cancel Order
            </button>
          ) : (
            <div className="cancel-form">
              <h4>Cancel Order</h4>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancellation..."
                rows="3"
              />
              <div className="cancel-actions">
                <button className="btn btn-danger" onClick={handleCancelOrder}>
                  Confirm Cancellation
                </button>
                <button className="btn btn-secondary" onClick={() => setShowCancelForm(false)}>
                  Keep Order
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OrderDetails;
