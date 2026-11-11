import React from 'react';

function RequestList({ requests, onViewRequest, onApprove }) {
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const completedRequests = requests.filter(r => r.status === 'completed');
  const declinedRequests = requests.filter(r => r.status === 'declined');

  return (
    <div className="container">
      <div className="stats-grid">
        <div className="stat-card pending">
          <h3>Pending Requests</h3>
          <p className="stat-number">{pendingRequests.length}</p>
        </div>
        
        <div className="stat-card completed">
          <h3>Completed</h3>
          <p className="stat-number">{completedRequests.length}</p>
        </div>

        <div className="stat-card declined">
          <h3>Declined</h3>
          <p className="stat-number">{declinedRequests.length}</p>
        </div>
      </div>

      <div className="content-section">
        <h2>📋 Pending Sticker Requests</h2>
        
        {pendingRequests.length === 0 ? (
          <div className="empty-state">
            <p>No pending requests</p>
          </div>
        ) : (
          <div className="requests-table">
            {pendingRequests.map(request => (
              <div key={request.id} className="request-card">
                <div className="request-info">
                  <h3>{request.studentName}</h3>
                  <p className="student-id">ID: {request.studentId}</p>
                  <p className="vehicle-info">
                    <span className="badge vehicle">{request.vehicleType}</span>
                    <span className="plate">{request.plateNumber}</span>
                  </p>
                  <p className="date">Submitted: {request.submittedDate}</p>
                </div>
                <div className="request-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => onViewRequest(request)}
                  >
                    View Details
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => onApprove(request)}
                  >
                    Approve & Customize
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {completedRequests.length > 0 && (
        <div className="content-section">
          <h2>✅ Completed Requests</h2>
          <div className="requests-table">
            {completedRequests.map(request => (
              <div key={request.id} className="request-card completed">
                <div className="request-info">
                  <h3>{request.studentName}</h3>
                  <p className="student-id">ID: {request.studentId}</p>
                  <span className="badge success">Completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {declinedRequests.length > 0 && (
        <div className="content-section">
          <h2>❌ Declined Requests</h2>
          <div className="requests-table">
            {declinedRequests.map(request => (
              <div key={request.id} className="request-card declined">
                <div className="request-info">
                  <h3>{request.studentName}</h3>
                  <p className="student-id">ID: {request.studentId}</p>
                  <p className="vehicle-info">
                    <span className="badge vehicle">{request.vehicleType}</span>
                    <span className="plate">{request.plateNumber}</span>
                  </p>
                  <span className="badge danger">Declined</span>
                  {request.declineReason && (
                    <p className="decline-reason">
                      <strong>Reason:</strong> {request.declineReason}
                    </p>
                  )}
                  <p className="date">Declined: {request.declinedDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RequestList;
