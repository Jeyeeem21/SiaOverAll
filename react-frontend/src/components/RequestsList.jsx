import React, { useEffect, useState } from 'react';
import { useStickerContext } from '../context/StickerContext';
import RequestCard from './RequestCard';
import './RequestsList.css';

const RequestsList = ({ filter = null }) => {
  const { requests, fetchRequests, loading, error } = useStickerContext();
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState(filter || 'all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    let filtered = requests;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    if (sortBy === 'date') {
      filtered = [...filtered].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'status') {
      filtered = [...filtered].sort((a, b) => a.status.localeCompare(b.status));
    } else if (sortBy === 'amount') {
      filtered = [...filtered].sort((a, b) => b.total_amount - a.total_amount);
    }

    setFilteredRequests(filtered);
  }, [requests, filterStatus, sortBy]);

  const statusOptions = [
    { value: 'all', label: 'All Requests' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'paid', label: 'Paid' },
    { value: 'printed', label: 'Printed' },
    { value: 'released', label: 'Released' },
  ];

  const getStatusBadge = (status) => {
    const statusClass = {
      pending: 'badge-warning',
      approved: 'badge-info',
      rejected: 'badge-danger',
      paid: 'badge-success',
      printed: 'badge-primary',
      released: 'badge-success',
      cancelled: 'badge-secondary',
    };
    return statusClass[status] || 'badge-secondary';
  };

  return (
    <div className="requests-list-container">
      <div className="list-header">
        <h2>Sticker Requests</h2>

        <div className="list-controls">
          <div className="control-group">
            <label htmlFor="filter-status">Filter by Status:</label>
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="sort-by">Sort by:</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date">Date (Newest)</option>
              <option value="status">Status</option>
              <option value="amount">Amount (Highest)</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="empty-state">
          <p>No sticker requests found</p>
          <p className="text-muted">
            {filterStatus === 'all'
              ? 'Create your first sticker request to get started'
              : `No requests with status "${filterStatus}"`}
          </p>
        </div>
      ) : (
        <div className="requests-grid">
          {filteredRequests.map(request => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}

      {filteredRequests.length > 0 && (
        <div className="list-footer">
          <p>Showing {filteredRequests.length} request(s)</p>
        </div>
      )}
    </div>
  );
};

export default RequestsList;
