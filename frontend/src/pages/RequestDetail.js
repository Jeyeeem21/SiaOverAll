import React, { useState } from 'react';

function RequestDetail({ request, onBack, onApprove, onDecline }) {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const handleViewDocument = (docName) => {
    setSelectedDocument(docName);
  };

  const closeModal = () => {
    setSelectedDocument(null);
  };

  const handleDeclineClick = () => {
    setShowDeclineModal(true);
  };

  const handleDeclineConfirm = () => {
    if (declineReason.trim()) {
      onDecline(request, declineReason);
      setShowDeclineModal(false);
      setDeclineReason('');
    } else {
      alert('Please provide a reason for declining this request.');
    }
  };

  const closeDeclineModal = () => {
    setShowDeclineModal(false);
    setDeclineReason('');
  };

  return (
    <div className="container">
      <button className="btn btn-back" onClick={onBack}>← Back to List</button>
      
      <div className="content-section">
        <h2>Request Details</h2>
        
        <div className="detail-grid">
          <div className="detail-section">
            <h3>Student Information</h3>
            <p><strong>Name:</strong> {request.studentName}</p>
            <p><strong>Student ID:</strong> {request.studentId}</p>
          </div>

          <div className="detail-section">
            <h3>Vehicle Information</h3>
            <p><strong>Type:</strong> {request.vehicleType}</p>
            <p><strong>Plate Number:</strong> {request.plateNumber}</p>
          </div>

          <div className="detail-section">
            <h3>Request Status</h3>
            <span className={`badge ${request.status}`}>{request.status}</span>
            <p className="date">Submitted: {request.submittedDate}</p>
          </div>
        </div>
      </div>

      <div className="content-section">
        <h2>📄 Submitted Documents</h2>
        <div className="documents-grid">
          {request.documents.map((doc, index) => (
            <div key={index} className="document-card">
              <div className="document-icon">
                📄
              </div>
              <h4>{doc}</h4>
              <button 
                className="btn btn-secondary btn-small"
                onClick={() => handleViewDocument(doc)}
              >
                👁️ View Document
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="content-section">
        <div className="action-buttons">
          <button className="btn btn-danger btn-large" onClick={handleDeclineClick}>
            ❌ Decline Request
          </button>
          <button className="btn btn-primary btn-large" onClick={() => onApprove(request)}>
            ✅ Approve & Customize Sticker
          </button>
        </div>
      </div>

      {/* Decline Confirmation Modal */}
      {showDeclineModal && (
        <div className="modal-overlay" onClick={closeDeclineModal}>
          <div className="modal-content decline-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>❌ Decline Request</h3>
              <button className="modal-close" onClick={closeDeclineModal}>✕</button>
            </div>
            <div className="modal-body">
              <p className="decline-warning">
                Are you sure you want to decline this sticker request from <strong>{request.studentName}</strong>?
              </p>
              <div className="form-group">
                <label>Reason for Declining *</label>
                <textarea
                  rows="4"
                  placeholder="Please provide a reason (e.g., Invalid documents, Incomplete information, etc.)"
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeDeclineModal}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeclineConfirm}>
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedDocument}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {/* Sample document display */}
              <div className="document-viewer">
                {selectedDocument === 'Official Receipt' && (
                  <div className="sample-document official-receipt">
                    <div className="doc-header">
                      <h3>Official Receipt (OR)</h3>
                    </div>
                    <div className="doc-info">
                      <p><strong>OR Number:</strong> 2024-001234</p>
                      <p><strong>Amount Paid:</strong> ₱500.00</p>
                      <p><strong>Payment For:</strong> Vehicle Sticker Application Fee</p>
                      <p><strong>Payor Name:</strong> {request.studentName}</p>
                      <p><strong>Date Issued:</strong> {request.submittedDate}</p>
                      <p><strong>Issued By:</strong> MSU Cashier's Office</p>
                    </div>
                    <div className="doc-footer">
                      <p className="sample-note">📌 This is a sample document for demo purposes</p>
                    </div>
                  </div>
                )}
                
                {selectedDocument === 'Certification of Registration' && (
                  <div className="sample-document registration">
                    <div className="doc-header">
                      <h3>Certificate of Registration (CR)</h3>
                    </div>
                    <div className="doc-info">
                      <p><strong>Plate Number:</strong> {request.plateNumber}</p>
                      <p><strong>Vehicle Type:</strong> {request.vehicleType}</p>
                      <p><strong>Owner:</strong> {request.studentName}</p>
                      <p><strong>Make/Model:</strong> Honda Click 150i</p>
                      <p><strong>Year Model:</strong> 2023</p>
                      <p><strong>Engine Number:</strong> KC150E-1234567</p>
                      <p><strong>Chassis Number:</strong> LBPKC1500A1234567</p>
                      <p><strong>Registration Date:</strong> January 2024</p>
                      <p><strong>Expiry Date:</strong> January 2025</p>
                    </div>
                    <div className="doc-footer">
                      <p className="sample-note">📌 This is a sample document for demo purposes</p>
                    </div>
                  </div>
                )}
                
                {selectedDocument === 'Driver\'s License' && (
                  <div className="sample-document drivers-license">
                    <div className="doc-header">
                      <h3>Driver's License</h3>
                      <div className="id-photo">👤</div>
                    </div>
                    <div className="doc-info">
                      <p><strong>Name:</strong> {request.studentName}</p>
                      <p><strong>License Number:</strong> N01-23-456789</p>
                      <p><strong>Restriction Code:</strong> 1 (Motorcycles)</p>
                      <p><strong>Date of Birth:</strong> January 15, 2003</p>
                      <p><strong>Address:</strong> Marawi City</p>
                      <p><strong>Issue Date:</strong> March 2023</p>
                      <p><strong>Expiry Date:</strong> March 2028</p>
                    </div>
                    <div className="doc-footer">
                      <p className="sample-note">📌 This is a sample document for demo purposes</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                Close
              </button>
              <button className="btn btn-primary">
                📥 Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RequestDetail;
