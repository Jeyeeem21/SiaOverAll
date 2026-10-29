import React, { useState } from 'react';
import { useStickerContext } from '../context/StickerContext';
import './StickerRequestForm.css';

const StickerRequestForm = ({ onSuccess }) => {
  const { stickerTypes, createRequest, uploadAttachment, loading, error } = useStickerContext();
  const [formData, setFormData] = useState({
    sticker_type_id: '',
    quantity: 1,
    vehicle_registration: '',
    vehicle_type: '',
    vehicle_color: '',
    vehicle_model: '',
    purpose: '',
    start_date: '',
    end_date: '',
  });
  const [attachments, setAttachments] = useState([]);
  const [submitError, setSubmitError] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const selectedType = stickerTypes.find(t => t.id === parseInt(formData.sticker_type_id));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = async (e, uploadType) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // File will be uploaded after request creation
      setAttachments(prev => [
        ...prev,
        { file, uploadType, name: file.name }
      ]);
    } catch (err) {
      setSubmitError('Failed to prepare file for upload');
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setFormSubmitting(true);

    try {
      // Create the sticker request
      const requestData = {
        ...formData,
        sticker_type_id: parseInt(formData.sticker_type_id),
        quantity: parseInt(formData.quantity),
      };

      const createdRequest = await createRequest(requestData);

      // Upload attachments
      for (const attachment of attachments) {
        await uploadAttachment(createdRequest.id, attachment.file, attachment.uploadType);
      }

      // Reset form
      setFormData({
        sticker_type_id: '',
        quantity: 1,
        vehicle_registration: '',
        vehicle_type: '',
        vehicle_color: '',
        vehicle_model: '',
        purpose: '',
        start_date: '',
        end_date: '',
      });
      setAttachments([]);

      if (onSuccess) {
        onSuccess(createdRequest);
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to create sticker request');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="sticker-request-form">
      <h2>Request Stickers</h2>
      
      {error && <div className="alert alert-error">{error}</div>}
      {submitError && <div className="alert alert-error">{submitError}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Select Sticker Type</h3>
          <div className="form-group">
            <label htmlFor="sticker_type_id">Sticker Type *</label>
            <select
              id="sticker_type_id"
              name="sticker_type_id"
              value={formData.sticker_type_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Choose a sticker type...</option>
              {stickerTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name} (${type.price.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {selectedType && (
            <div className="type-details">
              <p className="description">{selectedType.description}</p>
              <p className="validity">
                Valid for {selectedType.validity_days} days
              </p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="quantity">Quantity *</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              max="100"
              value={formData.quantity}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        {selectedType?.requires_vehicle_details && (
          <div className="form-section">
            <h3>Vehicle Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="vehicle_registration">Registration Number</label>
                <input
                  type="text"
                  id="vehicle_registration"
                  name="vehicle_registration"
                  value={formData.vehicle_registration}
                  onChange={handleInputChange}
                  placeholder="e.g., ABC-1234"
                />
              </div>
              <div className="form-group">
                <label htmlFor="vehicle_type">Vehicle Type</label>
                <select
                  id="vehicle_type"
                  name="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={handleInputChange}
                >
                  <option value="">Select type...</option>
                  <option value="car">Car</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="vehicle_model">Model</label>
                <input
                  type="text"
                  id="vehicle_model"
                  name="vehicle_model"
                  value={formData.vehicle_model}
                  onChange={handleInputChange}
                  placeholder="e.g., Honda Civic"
                />
              </div>
              <div className="form-group">
                <label htmlFor="vehicle_color">Color</label>
                <input
                  type="text"
                  id="vehicle_color"
                  name="vehicle_color"
                  value={formData.vehicle_color}
                  onChange={handleInputChange}
                  placeholder="e.g., Blue"
                />
              </div>
            </div>
          </div>
        )}

        <div className="form-section">
          <h3>Request Details</h3>
          <div className="form-group">
            <label htmlFor="purpose">Purpose</label>
            <textarea
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              rows="3"
              placeholder="Explain the purpose of this sticker request..."
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_date">Start Date</label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="end_date">End Date</label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Upload Requirements</h3>
          <div className="upload-group">
            <div className="upload-field">
              <label>Vehicle Document</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileSelect(e, 'vehicle_document')}
              />
              <p className="help-text">Registration or ownership document</p>
            </div>

            <div className="upload-field">
              <label>Identity Proof</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileSelect(e, 'identity')}
              />
              <p className="help-text">ID card or student/staff card</p>
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="attachments-list">
              <h4>Attached Files:</h4>
              {attachments.map((att, idx) => (
                <div key={idx} className="attachment-item">
                  <span>{att.name} ({att.uploadType})</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="btn-remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedType && (
          <div className="cost-summary">
            <p>
              Total Cost: <strong>${(selectedType.price * formData.quantity).toFixed(2)}</strong>
            </p>
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading || formSubmitting}
            className="btn btn-primary"
          >
            {formSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StickerRequestForm;
