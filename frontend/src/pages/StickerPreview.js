import React from 'react';

function StickerPreview({ sticker, onBack }) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert('Download functionality will be connected to backend API to generate PDF');
  };

  const vehiclePrefix = {
    'Motorcycle': 'M',
    'Car': 'C',
    'SUV': 'S',
    'Van': 'V',
    'Tricycle': 'T'
  };

  const getVehicleIcon = (type) => {
    switch(type) {
      case 'Motorcycle': return '🏍️';
      case 'Car': return '🚗';
      case 'SUV': return '🚙';
      case 'Van': return '🚐';
      case 'Tricycle': return '🛺';
      default: return '🏍️';
    }
  };

  return (
    <div className="container">
      <button className="btn btn-back no-print" onClick={onBack}>← Back to Requests</button>
      
      <div className="content-section no-print">
        <h2>✅ Sticker Generated Successfully!</h2>
        <div className="success-message">
          <p>Serial Number: <strong>{sticker.serialNumber}</strong></p>
          <p>Generated on: {sticker.generatedDate} at {sticker.generatedTime}</p>
        </div>
      </div>

      <div className="print-section">
        {/* MSU Official Sticker - Same as Live Preview */}
        <div className="msu-sticker-preview">
          {/* Header with University Name */}
          <div className="msu-sticker-header">
            <span className="university-name">Mindoro State University</span>
          </div>

          {/* Main Sticker Body - Grid Layout */}
          <div className="msu-sticker-body">
            {/* MSU Logo (Column 1, Row 1-2) */}
            <div className="msu-logo-circle">
              <img src="/R.png" alt="MSU Logo" className="logo-image" />
            </div>

            {/* Vehicle Code Section (Column 2, Row 1) */}
            <div className="vehicle-code-section">
              <div className="vehicle-code-line">
                {vehiclePrefix[sticker.vehicleType]}-{sticker.vehicleCode}
              </div>
              <div className="subtitle-text">
                Pass with one (1) valid ID
              </div>
              <div className="price-badge">
                P{sticker.price}
              </div>
            </div>

            {/* Vehicle Icon (Column 1, Row 2) */}
            <div className="vehicle-icon-box">
              <span className="vehicle-emoji">{getVehicleIcon(sticker.vehicleType)}</span>
            </div>

            {/* Gate Pass (Column 2, Row 2) */}
            <div className="gate-pass-section">
              <div className="gate-pass-text">
                GATE PASS
              </div>
            </div>

            {/* Date Vertical (Column 3, Row 1-2) */}
            <div className="date-vertical">
              <div className="month-vert">{sticker.month}</div>
              <div className="year-vert">
                {sticker.year.split('').map((digit, i) => (
                  <div key={i} className="year-digit">{digit}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="preview-note no-print" style={{marginTop: '15px'}}>
          <p>Serial No: {sticker.serialNumber}</p>
        </div>

        {/* Additional Info (Not on sticker) */}
        <div className="sticker-metadata no-print">
          <h3>Sticker Details</h3>
          <p><strong>Student:</strong> {sticker.studentName}</p>
          <p><strong>Student ID:</strong> {sticker.studentId}</p>
          <p><strong>Generated:</strong> {sticker.generatedDate} at {sticker.generatedTime}</p>
        </div>
      </div>

      <div className="action-buttons no-print">
        <button className="btn btn-success btn-large" onClick={handlePrint}>
          🖨️ Print Sticker
        </button>
        <button className="btn btn-primary btn-large" onClick={handleDownload}>
          📥 Download PDF
        </button>
      </div>

      <div className="info-box no-print">
        <h4>📌 Print Instructions:</h4>
        <ul>
          <li>Use sticker paper (4" x 6" recommended)</li>
          <li>Set printer to highest quality</li>
          <li>Ensure proper alignment before printing</li>
          <li>Cut along the edges after printing</li>
        </ul>
      </div>
    </div>
  );
}

export default StickerPreview;
