import React, { useState } from 'react';
import { useStickerContext } from '../context/StickerContext';
import './RequestCard.css';

const RequestCard = ({ request }) => {
  const {
    approveRequest,
    rejectRequest,
    markAsPaid,
    generateStickers,
    releaseStickers,
    reprintSticker,
    loading,
  } = useStickerContext();
  const [showDetails, setShowDetails] = useState(false);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const userRole = localStorage.getItem('userRole');
  const isStaff = userRole === 'admin' || userRole === 'staff';

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      approved: '#17a2b8',
      rejected: '#dc3545',
      paid: '#28a745',
      printed: '#007bff',
      released: '#28a745',
      cancelled: '#6c757d',
    };
    return colors[status] || '#6c757d';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending Approval',
      approved: 'Approved',
      rejected: 'Rejected',
      paid: 'Payment Received',
      printed: 'Printed',
      released: 'Released',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await approveRequest(request.id, approvalNotes);
      setShowApprovalForm(false);
      setApprovalNotes('');
    } catch (err) {
      console.error('Failed to approve:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    setActionLoading(true);
    try {
      await rejectRequest(request.id, rejectionReason);
      setRejectionReason('');
    } catch (err) {
      console.error('Failed to reject:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!paymentRef.trim()) {
      alert('Please enter payment reference');
      return;
    }
    setActionLoading(true);
    try {
      await markAsPaid(request.id, paymentRef);
      setPaymentRef('');
    } catch (err) {
      console.error('Failed to mark as paid:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateStickers = async () => {
    setActionLoading(true);
    try {
      await generateStickers(request.id);
    } catch (err) {
      console.error('Failed to generate stickers:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReleaseStickers = async () => {
    setActionLoading(true);
    try {
      await releaseStickers(request.id);
    } catch (err) {
      console.error('Failed to release stickers:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="request-card">
      <div className="card-header">
        <div className="header-info">
          <h3>{request.sticker_type?.name}</h3>
          <span
            className="status-badge"
            style={{ backgroundColor: getStatusColor(request.status) }}
          >
            {getStatusLabel(request.status)}
          </span>
        </div>
        <div className="card-meta">
          <span className="quantity">Qty: {request.quantity}</span>
          <span className="amount">${request.total_amount.toFixed(2)}</span>
        </div>
      </div>

      <div className="card-body">
        <div className="info-row">
          <span className="label">Request Date:</span>
          <span className="value">{formatDate(request.created_at)}</span>
        </div>

        {request.vehicle_registration && (
          <div className="info-row">
            <span className="label">Vehicle:</span>
            <span className="value">
              {request.vehicle_registration} ({request.vehicle_type})
            </span>
          </div>
        )}

        {request.purpose && (
          <div className="info-row">
            <span className="label">Purpose:</span>
            <span className="value truncate">{request.purpose}</span>
          </div>
        )}

        {request.approved_at && (
          <div className="info-row">
            <span className="label">Approved:</span>
            <span className="value">{formatDate(request.approved_at)}</span>
          </div>
        )}

        {request.stickers && request.stickers.length > 0 && (
          <div className="info-row">
            <span className="label">Stickers Generated:</span>
            <span className="value">{request.stickers.length}</span>
          </div>
        )}
      </div>

      <div className="card-footer">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="btn-text"
        >
          {showDetails ? 'Hide Details' : 'View Details'}
        </button>

        {isStaff && (
          <div className="staff-actions">
            {request.status === 'pending' && (
              <>
                <button
                  onClick={() => setShowApprovalForm(!showApprovalForm)}
                  className="btn-sm btn-success"
                  disabled={actionLoading}
                >
                  Approve
                </button>
                <button
                  onClick={() => setRejectionReason('')}
                  className="btn-sm btn-danger"
                  disabled={actionLoading}
                >
                  Reject
                </button>
              </>
            )}

            {request.status === 'approved' && (
              <button
                onClick={() => setPaymentRef('')}
                className="btn-sm btn-info"
                disabled={actionLoading}
              >
                Mark Paid
              </button>
            )}

            {request.status === 'paid' && (
              <button
                onClick={handleGenerateStickers}
                className="btn-sm btn-primary"
                disabled={actionLoading || loading}
              >
                Print Stickers
              </button>
            )}

            {request.status === 'printed' && (
              <button
                onClick={handleReleaseStickers}
                className="btn-sm btn-success"
                disabled={actionLoading || loading}
              >
                Release
              </button>
            )}
          </div>
        )}
      </div>

      {showDetails && (
        <div className="card-details">
          <h4>Request Details</h4>
          <div className="details-grid">
            <div className="detail-item">
              <span className="label">Status:</span>
              <span className="value">{getStatusLabel(request.status)}</span>
            </div>
            <div className="detail-item">
              <span className="label">Quantity:</span>
              <span className="value">{request.quantity}</span>
            </div>
            <div className="detail-item">
              <span className="label">Total Amount:</span>
              <span className="value">${request.total_amount.toFixed(2)}</span>
            </div>

            {request.approval_notes && (
              <div className="detail-item full-width">
                <span className="label">Approval Notes:</span>
                <p className="note">{request.approval_notes}</p>
              </div>
            )}

            {request.rejection_reason && (
              <div className="detail-item full-width">
                <span className="label">Rejection Reason:</span>
                <p className="note rejection">{request.rejection_reason}</p>
              </div>
            )}

            {request.stickers && request.stickers.length > 0 && (
              <div className="detail-item full-width">
                <span className="label">Generated Stickers:</span>
                <div className="stickers-list">
                  {request.stickers.map(sticker => (
                    <div key={sticker.id} className="sticker-info">
                      <code>{sticker.serial_number}</code>
                      <span className="date">
                        Expires: {formatDate(sticker.expiry_date)}
                      </span>
                      {sticker.status === 'active' && sticker.reprint_count < 3 && (
                        <button
                          onClick={() => reprintSticker(sticker.id)}
                          className="btn-mini"
                          disabled={actionLoading}
                        >
                          Reprint
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showApprovalForm && (
        <div className="card-form">
          <textarea
            placeholder="Add approval notes (optional)..."
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            rows="3"
          ></textarea>
          <div className="form-actions">
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="btn-sm btn-success"
            >
              Confirm Approval
            </button>
            <button
              onClick={() => setShowApprovalForm(false)}
              className="btn-sm btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {request.status === 'pending' && isStaff && rejectionReason !== '' && (
        <div className="card-form">
          <textarea
            placeholder="Rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows="3"
          ></textarea>
          <div className="form-actions">
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="btn-sm btn-danger"
            >
              Confirm Rejection
            </button>
            <button
              onClick={() => setRejectionReason('')}
              className="btn-sm btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {request.status === 'approved' && isStaff && paymentRef !== '' && (
        <div className="card-form">
          <input
            type="text"
            placeholder="Payment reference..."
            value={paymentRef}
            onChange={(e) => setPaymentRef(e.target.value)}
          />
          <div className="form-actions">
            <button
              onClick={handleMarkPaid}
              disabled={actionLoading}
              className="btn-sm btn-success"
            >
              Confirm Payment
            </button>
            <button
              onClick={() => setPaymentRef('')}
              className="btn-sm btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestCard;
