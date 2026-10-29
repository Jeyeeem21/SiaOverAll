import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useStudent } from '../contexts/StudentContext';
import SkeletonLoader from './SkeletonLoader';
import './CreateOrder.css';

function CreateOrder({ onOrderCreated }) {
  const { student } = useStudent();
  
  const [formData, setFormData] = useState({
    student_name: student?.student_name || '',
    student_email: student?.student_email || '',
    student_phone: student?.student_phone || '',
    student_id: student?.student_id || '',
    color_type: '',
    paper_size: '',
    orientation: '',
    print_side: '',
    copies: '',
    pages_per_document: '',
    binding_type: 'none',
    lamination: false,
    lamination_type: 'glossy',
    lamination_item: '',
    lamination_quantity: '',
    payment_method: 'cash_on_pickup',
    preferred_pickup_date: '',
    special_instructions: '',
  });

  // Update form when student context changes
  useEffect(() => {
    if (student) {
      setFormData(prev => ({
        ...prev,
        student_name: student.student_name || prev.student_name,
        student_email: student.student_email || prev.student_email,
        student_phone: student.student_phone || prev.student_phone,
        student_id: student.student_id || prev.student_id,
      }));
    }
  }, [student]);

  const [files, setFiles] = useState([]);
  const [paymentProof, setPaymentProof] = useState(null);
  const [pricing, setPricing] = useState([]);
  const [estimatedCost, setEstimatedCost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('printing');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isLoadingPricing, setIsLoadingPricing] = useState(true);

  // Load pricing on mount
  useEffect(() => {
    loadPricing();
  }, []);

  // Calculate cost when options change
  useEffect(() => {
    if (formData.pages_per_document > 0 && formData.copies > 0) {
      calculateCost();
    }
  }, [
    formData.color_type,
    formData.paper_size,
    formData.print_side,
    formData.pages_per_document,
    formData.copies,
    formData.binding_type,
    formData.lamination,
    formData.lamination_type,
    formData.lamination_item,
    formData.lamination_quantity,
  ]);

  const loadPricing = async () => {
    try {
      setIsLoadingPricing(true);
      const result = await api.getPricing();
      if (result.success) {
        setPricing(result.data);
      }
    } catch (err) {
      console.error('Failed to load pricing:', err);
    } finally {
      setIsLoadingPricing(false);
    }
  };

  const calculateCost = async () => {
    try {
      const result = await api.calculateCost({
        color_type: formData.color_type,
        paper_size: formData.paper_size,
        print_side: formData.print_side,
        pages_per_document: parseInt(formData.pages_per_document),
        copies: parseInt(formData.copies),
        binding_type: formData.binding_type,
        lamination: formData.lamination,
        lamination_type: formData.lamination_type,
      });

      if (result.success) {
        setEstimatedCost(result.data);
      }
    } catch (err) {
      console.error('Failed to calculate cost:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Check if adding these files would exceed the limit
    const totalFiles = files.length + selectedFiles.length;
    if (totalFiles > 5) {
      setError('Maximum 5 files allowed');
      setShowErrorModal(true);
      e.target.value = ''; // Clear the input
      return;
    }

    // Validate file types
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const invalidFiles = selectedFiles.filter(file => {
      const fileName = file.name.toLowerCase();
      return !allowedExtensions.some(ext => fileName.endsWith(ext));
    });

    if (invalidFiles.length > 0) {
      setError(`Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}. Only PDF, DOC, DOCX, and TXT files are allowed.`);
      setShowErrorModal(true);
      e.target.value = ''; // Clear the input
      return;
    }

    // Validate file sizes
    const oversizedFiles = selectedFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`File(s) too large: ${oversizedFiles.map(f => f.name).join(', ')}. Maximum size is 10MB per file.`);
      setShowErrorModal(true);
      e.target.value = ''; // Clear the input
      return;
    }

    // Add new files to existing files
    setFiles(prev => [...prev, ...selectedFiles]);
    setError(null);
    e.target.value = ''; // Clear the input so same file can be added again if removed
  };

  const handleRemoveFile = (indexToRemove) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handlePaymentProofChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError('Payment proof file must be less than 5MB');
        setShowErrorModal(true);
        e.target.value = ''; // Clear the input
        return;
      }
      setPaymentProof(file);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Check if at least one service is selected
    const hasFiles = files.length > 0;
    const hasBinding = formData.binding_type !== 'none';
    const hasLamination = formData.lamination;

    if (!hasFiles && !hasBinding && !hasLamination) {
      setError('Please select at least one service (printing, binding, or lamination)');
      setShowErrorModal(true);
      setLoading(false);
      return;
    }

    // If files are uploaded, we need print options
    if (hasFiles) {
      // Validation for print options is handled by HTML required attributes
    }

    // Validate payment proof if upload_proof is selected
    if (formData.payment_method === 'upload_proof' && !paymentProof) {
      setError('Please upload payment proof');
      setShowErrorModal(true);
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        // Convert boolean to 0 or 1 for lamination
        if (key === 'lamination') {
          data.append(key, formData[key] ? 1 : 0);
        } else if (key === 'lamination_type' && !formData.lamination) {
          // Don't send lamination_type if lamination is false
          return;
        } else if ((key === 'lamination_item' || key === 'lamination_quantity') && !formData.lamination) {
          // Don't send lamination details if lamination is false
          return;
        } else {
          data.append(key, formData[key]);
        }
      });

      // Add files
      files.forEach(file => {
        data.append('files[]', file);
      });

      // Add payment proof if provided
      if (paymentProof) {
        data.append('payment_proof', paymentProof);
      }

      const result = await api.createOrder(data);

      if (result.success) {
        // Save email to localStorage for future use
        localStorage.setItem('studentEmail', formData.student_email);
        
        setSuccess(`Order created successfully! Order Number: ${result.data.order_number}`);
        // Reset form
        setTimeout(() => {
          if (onOrderCreated) {
            onOrderCreated();
          }
        }, 2000);
      } else {
        setError(result.message || 'Failed to create order');
      }
    } catch (err) {
      setError('An error occurred while creating the order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-order">
      {/* Show skeleton loading */}
      {isLoadingPricing ? (
        <SkeletonLoader type="form" count={1} />
      ) : (
        <>
          {/* Error Modal */}
          {showErrorModal && (
        <div className="modal-overlay" onClick={() => setShowErrorModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-icon">⚠️</span>
              <h3>Upload Error</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowErrorModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>{error}</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-modal-close" 
                onClick={() => setShowErrorModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <h2>Create New Print Order</h2>

      {error && !showErrorModal && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {!student && (
        <div className="alert alert-info" style={{marginBottom: '20px'}}>
          ℹ️ <strong>Testing Mode:</strong> Student information will be auto-filled when integrated with parent system.
        </div>
      )}

      <form onSubmit={handleSubmit} className="order-form">
        {/* Student Information - Always visible */}
        <div className="form-section">
          <h3>Student Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Student Name *</label>
              <input
                type="text"
                name="student_name"
                value={formData.student_name}
                onChange={handleInputChange}
                readOnly={!!student}
                required
                style={student ? {backgroundColor: '#f5f5f5', cursor: 'not-allowed'} : {}}
              />
            </div>
            <div className="form-group">
              <label>Student ID</label>
              <input
                type="text"
                name="student_id"
                value={formData.student_id}
                onChange={handleInputChange}
                readOnly={!!student}
                style={student ? {backgroundColor: '#f5f5f5', cursor: 'not-allowed'} : {}}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="student_email"
                value={formData.student_email}
                onChange={handleInputChange}
                readOnly={!!student}
                required
                style={student ? {backgroundColor: '#f5f5f5', cursor: 'not-allowed'} : {}}
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="student_phone"
                value={formData.student_phone}
                onChange={handleInputChange}
                readOnly={!!student}
                style={student ? {backgroundColor: '#f5f5f5', cursor: 'not-allowed'} : {}}
              />
            </div>
          </div>
          {student && (
            <div className="info-note">
              ℹ️ Your information is pre-filled from your student account
            </div>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="order-tabs">
          <button
            type="button"
            className={`tab-button ${activeTab === 'printing' ? 'active' : ''}`}
            onClick={() => setActiveTab('printing')}
          >
            🖨️ Printing Options
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'binding' ? 'active' : ''}`}
            onClick={() => setActiveTab('binding')}
          >
            📎 Binding Service
            {formData.binding_type !== 'none' && <span className="tab-badge">✓</span>}
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'lamination' ? 'active' : ''}`}
            onClick={() => setActiveTab('lamination')}
          >
            🪪 Lamination Service
            {formData.lamination && <span className="tab-badge">✓</span>}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'printing' && (
          <>
            {/* Print Options */}
            <div className="form-section">
              <h3>🖨️ Print Options</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Color Type *</label>
                  <select
                    name="color_type"
                    value={formData.color_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select color type</option>
                    <option value="black_white">Black & White</option>
                    <option value="colored">Colored</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Paper Size *</label>
                  <select
                    name="paper_size"
                    value={formData.paper_size}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select paper size</option>
                    <option value="A4">A4</option>
                    <option value="A3">A3</option>
                    <option value="Letter">Letter</option>
                    <option value="Legal">Legal</option>
                    <option value="Short">Short</option>
                    <option value="Long">Long</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Orientation *</label>
                  <select
                    name="orientation"
                    value={formData.orientation}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select orientation</option>
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Print Side *</label>
                  <select
                    name="print_side"
                    value={formData.print_side}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select print side</option>
                    <option value="single">Single-sided</option>
                    <option value="double">Double-sided</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Pages per Document *</label>
                  <input
                    type="number"
                    name="pages_per_document"
                    value={formData.pages_per_document}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Number of Copies *</label>
                  <input
                    type="number"
                    name="copies"
                    value={formData.copies}
                    onChange={handleInputChange}
                    min="1"
                    max="1000"
                    required
                  />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="form-section">
              <h3>📁 Upload Files</h3>
              <div className="form-group">
                <label>Select Files (Max 5 files, 10MB each) *</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  required
                />
                {files.length > 0 && (
                  <div className="file-list">
                    <p><strong>Selected Files ({files.length}/5):</strong></p>
                    <ul>
                      {files.map((file, index) => (
                        <li key={index}>
                          <span className="file-info">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </span>
                          <button
                            type="button"
                            className="btn-remove-file"
                            onClick={() => handleRemoveFile(index)}
                            title="Remove file"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'binding' && (
          <>
            {/* Binding */}
            <div className="form-section">
              <h3>📎 Binding Options</h3>
              <p style={{fontSize: '14px', color: '#666', marginBottom: '15px'}}>Bind your printed documents together</p>
              <div className="form-row">
                <div className="form-group">
                  <label>Binding Type</label>
                  <select
                    name="binding_type"
                    value={formData.binding_type}
                    onChange={handleInputChange}
                  >
                    <option value="none">No Binding</option>
                    <option value="spiral">Spiral Binding (₱15.00)</option>
                    <option value="staple">Staple (₱5.00)</option>
                    <option value="plastic_comb">Plastic Comb (₱20.00)</option>
                  </select>
                </div>
              </div>
              {formData.binding_type !== 'none' && (
                <div className="info-note">
                  ✓ Binding service selected: {formData.binding_type.replace(/_/g, ' ')}
                </div>
              )}
            </div>

            {/* File Upload for Binding */}
            <div className="form-section">
              <h3>📁 Upload Files (Optional)</h3>
              <p style={{fontSize: '14px', color: '#666', marginBottom: '15px'}}>
                Upload files if you need printing + binding. Skip if you only need binding service.
              </p>
              <div className="form-group">
                <label>Select Files (Max 5 files, 10MB each)</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                />
                {files.length > 0 && (
                  <div className="file-list">
                    <p><strong>Selected Files ({files.length}/5):</strong></p>
                    <ul>
                      {files.map((file, index) => (
                        <li key={index}>
                          <span className="file-info">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </span>
                          <button
                            type="button"
                            className="btn-remove-file"
                            onClick={() => handleRemoveFile(index)}
                            title="Remove file"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'lamination' && (
          <>
            {/* Lamination */}
            <div className="form-section">
              <h3>🪪 ID/Card Lamination</h3>
              <p style={{fontSize: '14px', color: '#666', marginBottom: '15px'}}>For laminating ID cards, photos, certificates, or small documents</p>
              <div className="form-row">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="lamination"
                      checked={formData.lamination}
                      onChange={handleInputChange}
                    />
                    <span>I need lamination service</span>
                  </label>
                </div>
              </div>

              {formData.lamination && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>What to Laminate *</label>
                      <select
                        name="lamination_item"
                        value={formData.lamination_item}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select item type</option>
                        <option value="ID Card">ID Card</option>
                        <option value="Photo">Photo (1x1, 2x2, etc.)</option>
                        <option value="Certificate">Certificate</option>
                        <option value="Document">Document</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Quantity *</label>
                      <input
                        type="number"
                        name="lamination_quantity"
                        value={formData.lamination_quantity}
                        onChange={handleInputChange}
                        min="1"
                        max="100"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Lamination Type *</label>
                      <select
                        name="lamination_type"
                        value={formData.lamination_type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="glossy">Glossy Finish (₱10-15 per item)</option>
                        <option value="matte">Matte Finish (₱10-15 per item)</option>
                      </select>
                    </div>
                  </div>
                  <div className="info-note">
                    💡 Price varies by size. Standard ID size: ₱10, Larger items: ₱15
                  </div>
                </>
              )}
            </div>

            {/* File Upload for Lamination */}
            <div className="form-section">
              <h3>📁 Upload Files (Optional)</h3>
              <p style={{fontSize: '14px', color: '#666', marginBottom: '15px'}}>
                Upload files if you need printing + lamination. Skip if you only need lamination service.
              </p>
              <div className="form-group">
                <label>Select Files (Max 5 files, 10MB each)</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                />
                {files.length > 0 && (
                  <div className="file-list">
                    <p><strong>Selected Files ({files.length}/5):</strong></p>
                    <ul>
                      {files.map((file, index) => (
                        <li key={index}>
                          <span className="file-info">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </span>
                          <button
                            type="button"
                            className="btn-remove-file"
                            onClick={() => handleRemoveFile(index)}
                            title="Remove file"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Payment Method - Always visible */}
        <div className="form-section">
          <h3>💳 Payment Method</h3>
          <div className="form-group">
            <label>How would you like to pay? *</label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleInputChange}
              required
            >
              <option value="cash_on_pickup">💵 Cash on Pickup</option>
              <option value="upload_proof">📤 Upload Payment Proof</option>
            </select>
          </div>

          {formData.payment_method === 'upload_proof' && (
            <div className="form-group">
              <label>Upload Payment Proof (Image or PDF, Max 5MB) *</label>
              <input
                type="file"
                onChange={handlePaymentProofChange}
                accept=".jpg,.jpeg,.png,.pdf"
                required
              />
              {paymentProof && (
                <div className="file-list">
                  <p><strong>Selected:</strong> {paymentProof.name} ({(paymentProof.size / 1024 / 1024).toFixed(2)} MB)</p>
                </div>
              )}
              <small style={{ color: '#888', display: 'block', marginTop: '8px' }}>
                Please upload a screenshot or photo of your payment receipt/transaction
              </small>
            </div>
          )}

          {formData.payment_method === 'cash_on_pickup' && (
            <div className="info-box">
              <p>💡 You will pay in cash when you pick up your printed documents.</p>
            </div>
          )}
        </div>

        {/* Additional Details */}
        <div className="form-section">
          <h3>Additional Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Preferred Pickup Date & Time</label>
              <input
                type="datetime-local"
                name="preferred_pickup_date"
                value={formData.preferred_pickup_date}
                onChange={handleInputChange}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Special Instructions</label>
            <textarea
              name="special_instructions"
              value={formData.special_instructions}
              onChange={handleInputChange}
              rows="3"
              placeholder="Any special requests or instructions..."
            />
          </div>
        </div>

        {/* Cost Estimate */}
        {estimatedCost && (
          <div className="cost-estimate">
            <h3>💰 Estimated Cost</h3>
            <div className="cost-breakdown">
              {estimatedCost.breakdown && Object.entries(estimatedCost.breakdown).map(([key, value]) => (
                <div key={key} className="cost-item">
                  <span>{value}</span>
                </div>
              ))}
              <div className="cost-total">
                <strong>Total Amount:</strong>
                <strong className="total-price">₱{estimatedCost.total_amount}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Order...' : '🚀 Submit Order'}
          </button>
        </div>
      </form>
        </>
      )}
    </div>
  );
}

export default CreateOrder;
