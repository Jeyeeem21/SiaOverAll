import React, { useState } from 'react';

function StickerCustomization({ request, onBack, onGenerate }) {
  const currentMonth = new Date().toLocaleString('default', { month: 'short' }).toUpperCase();
  const currentYear = new Date().getFullYear();
  
  const [formData, setFormData] = useState({
    vehicleCode: request.plateNumber || '',
    vehicleType: request.vehicleType || 'Motorcycle',
    price: '100',
    month: currentMonth,
    year: currentYear.toString(),
    studentName: request.studentName,
    studentId: request.studentId
  });

  const vehiclePrefix = {
    'Motorcycle': 'M',
    'Car': 'C',
    'SUV': 'S',
    'Van': 'V',
    'Tricycle': 'T'
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(formData);
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
      <button className="btn btn-back" onClick={onBack}>← Back</button>
      
      <div className="customization-layout">
        <div className="customization-form">
          <h2>🎨 Customize Sticker</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Vehicle Type *</label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                required
              >
                <option value="Motorcycle">Motorcycle (M)</option>
                <option value="Car">Car (C)</option>
                <option value="SUV">SUV (S)</option>
                <option value="Van">Van (V)</option>
                <option value="Tricycle">Tricycle (T)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Vehicle Code Number *</label>
              <input
                type="text"
                name="vehicleCode"
                value={formData.vehicleCode}
                onChange={handleChange}
                placeholder="e.g., 128"
                required
              />
              <small>Will appear as: {vehiclePrefix[formData.vehicleType]}-{formData.vehicleCode}</small>
            </div>

            <div className="form-group">
              <label>Price (PHP) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Valid Month *</label>
              <select
                name="month"
                value={formData.month}
                onChange={handleChange}
                required
              >
                <option value="JAN">January</option>
                <option value="FEB">February</option>
                <option value="MAR">March</option>
                <option value="APR">April</option>
                <option value="MAY">May</option>
                <option value="JUN">June</option>
                <option value="JUL">July</option>
                <option value="AUG">August</option>
                <option value="SEP">September</option>
                <option value="OCT">October</option>
                <option value="NOV">November</option>
                <option value="DEC">December</option>
              </select>
            </div>

            <div className="form-group">
              <label>Valid Year *</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="2024"
                max="2030"
                required
              />
            </div>

            <div className="info-section">
              <p><strong>Student:</strong> {formData.studentName}</p>
              <p><strong>Student ID:</strong> {formData.studentId}</p>
            </div>

            <button type="submit" className="btn btn-primary btn-large">
              Generate Sticker Preview
            </button>
          </form>
        </div>

        <div className="sticker-preview-panel">
          <h3>🎫 Live Preview</h3>
          <div className="msu-sticker-preview">
            {/* Header */}
            <div className="msu-sticker-header">
              <span className="university-name">Mindoro State University</span>
            </div>

            {/* Main Body - Grid Layout */}
            <div className="msu-sticker-body">
              {/* MSU Logo (Column 1, Row 1-2) */}
              <div className="msu-logo-circle">
                <img src="/R.png" alt="MSU Logo" className="logo-image" />
              </div>

              {/* Vehicle Code Section (Column 2, Row 1) */}
              <div className="vehicle-code-section">
                <div className="vehicle-code-line">
                  {vehiclePrefix[formData.vehicleType]}-{formData.vehicleCode || '128'}
                </div>
                <div className="subtitle-text">
                  Pass with one (1) valid ID
                </div>
                <div className="price-badge">
                  P{formData.price}
                </div>
              </div>

              {/* Vehicle Icon (Column 1, Row 2) */}
              <div className="vehicle-icon-box">
                <span className="vehicle-emoji">{getVehicleIcon(formData.vehicleType)}</span>
              </div>

              {/* Gate Pass (Column 2, Row 2) */}
              <div className="gate-pass-section">
                <div className="gate-pass-text">
                  GATE PASS
                </div>
              </div>

              {/* Date Vertical (Column 3, Row 1-2) */}
              <div className="date-vertical">
                <div className="month-vert">{formData.month}</div>
                <div className="year-vert">
                  {formData.year.split('').map((digit, i) => (
                    <div key={i} className="year-digit">{digit}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="preview-note">
            <p>⚠️ This is a preview. Final sticker will be generated after submission.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StickerCustomization;
