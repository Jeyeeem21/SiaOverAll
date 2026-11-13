import { ArrowLeft, Printer, Download, Bike, Car, Truck, Bus, CheckCircle } from 'lucide-react';
import { useState } from 'react';

// Skeleton Loader Component
function StickerSkeleton() {
  return (
    <div className="container">
      <div className="content-section no-print">
        <div className="skeleton" style={{width: '60%', height: '24px', marginBottom: '12px'}}></div>
        <div className="success-message">
          <div className="skeleton" style={{width: '40%', height: '16px', marginBottom: '8px'}}></div>
          <div className="skeleton" style={{width: '50%', height: '16px'}}></div>
        </div>
      </div>

      <div className="sticker-preview-single-column">
        <div className="print-section no-print">
          <div className="skeleton" style={{width: '100%', height: '320px', borderRadius: '12px'}}></div>
          <div className="skeleton" style={{width: '40%', height: '14px', marginTop: '15px', marginLeft: 'auto', marginRight: 'auto'}}></div>
        </div>

        <div className="sticker-details-row no-print">
          <div className="sticker-metadata">
            <div className="skeleton" style={{width: '50%', height: '18px', marginBottom: '12px'}}></div>
            <div className="skeleton" style={{width: '80%', height: '14px', marginBottom: '8px'}}></div>
            <div className="skeleton" style={{width: '70%', height: '14px', marginBottom: '8px'}}></div>
            <div className="skeleton" style={{width: '90%', height: '14px'}}></div>
          </div>

          <div className="info-box">
            <div className="skeleton" style={{width: '60%', height: '16px', marginBottom: '12px'}}></div>
            <div className="skeleton" style={{width: '100%', height: '12px', marginBottom: '6px'}}></div>
            <div className="skeleton" style={{width: '95%', height: '12px', marginBottom: '6px'}}></div>
            <div className="skeleton" style={{width: '90%', height: '12px', marginBottom: '6px'}}></div>
            <div className="skeleton" style={{width: '85%', height: '12px'}}></div>
          </div>
        </div>

        <div className="action-buttons no-print">
          <div className="skeleton" style={{width: '100%', height: '44px', borderRadius: '12px'}}></div>
          <div className="skeleton" style={{width: '100%', height: '44px', borderRadius: '12px'}}></div>
        </div>
      </div>
    </div>
  );
}

function StickerPreview({ sticker, onBack, onMarkPrinted, loading }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert('Download functionality will be connected to backend API to generate PDF');
  };

  const handleMarkPrintedClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmMarkPrinted = () => {
    onMarkPrinted(sticker.requestId);
    setShowConfirmModal(false);
  };

  const handleCancelMarkPrinted = () => {
    setShowConfirmModal(false);
  };

  // Show skeleton if loading
  if (loading) {
    return <StickerSkeleton />;
  }

  const vehiclePrefix = {
    'Motorcycle': 'M',
    'Car': 'C',
    'SUV': 'S',
    'Van': 'V',
    'Tricycle': 'T',
    'Other': 'O',
  };

  const getVehicleIcon = (type) => {
    const iconClass = "w-12 h-12";
    switch(type) {
      case 'Motorcycle': return <Bike className={iconClass} />;
      case 'Car': return <Car className={iconClass} />;
      case 'SUV': return <Truck className={iconClass} />;
      case 'Van': return <Bus className={iconClass} />;
      case 'Tricycle': return <Bike className={iconClass} />;
      default: return <Bike className={iconClass} />;
    }
  };

  return (
    <div className="container">
      <div className="content-section no-print">
        <h2>Sticker Generated Successfully!</h2>
        <div className="success-message">
          <p>Serial Number: <strong>{sticker.serialNumber}</strong></p>
          <p>Generated on: {sticker.generatedDate} at {sticker.generatedTime}</p>
        </div>
      </div>

      <div className="sticker-preview-single-column">
        {/* Sticker Preview - Full Width */}
        <div className="print-section no-print">
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
        </div>

        {/* Details, Buttons, and Instructions - Below Sticker */}
        <div className="sticker-details-row no-print">
          <div className="sticker-metadata">
            <h3>Sticker Details</h3>
            <p><strong>Student:</strong> {sticker.studentName}</p>
            <p><strong>Student ID:</strong> {sticker.studentId}</p>
            <p><strong>Generated:</strong> {sticker.generatedDate} at {sticker.generatedTime}</p>
          </div>

          <div className="info-box">
            <h4>📌 Print Instructions:</h4>
            <ul>
              <li>Use sticker paper (4" x 6" recommended)</li>
              <li>Set printer to highest quality</li>
              <li>Ensure proper alignment before printing</li>
              <li>Cut along the edges after printing</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons - Full Width Below */}
        <div className="action-buttons no-print">
          <button className="button-primary" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            Print Sticker
          </button>
          {sticker.status !== 'completed' && (
            <button className="button-secondary" onClick={handleMarkPrintedClick}>
              Mark as Printed
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={handleCancelMarkPrinted}>
          <div className="modal-content" style={{maxWidth: '400px'}} onClick={(e) => e.stopPropagation()}>
            <div className="modal-body" style={{textAlign: 'center', padding: '32px 24px'}}>
              <div style={{display: 'flex', justifyContent: 'center', marginBottom: '16px'}}>
                <CheckCircle className="w-12 h-12" style={{color: '#059669'}} />
              </div>
              <h3 style={{margin: '0 0 12px', fontSize: '18px', fontWeight: '600', color: '#111827'}}>
                Mark Sticker as Printed?
              </h3>
              <p style={{margin: '0', color: '#6b7280', fontSize: '14px'}}>
                This will mark the sticker for <strong>{sticker.studentName}</strong> as printed and update the request status to completed.
              </p>
            </div>
            <div className="modal-footer">
              <button className="button-secondary" onClick={handleCancelMarkPrinted}>
                Cancel
              </button>
              <button className="button-primary" onClick={handleConfirmMarkPrinted}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StickerPreview;
