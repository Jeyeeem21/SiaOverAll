import React, { useState } from 'react';
import { useStickerContext } from '../context/StickerContext';
import './StickerRequestForm.css';

const StickerRequestForm = ({ onSuccess }) => {
  const { stickerTypes, createRequest, uploadAttachment, loading, error } = useStickerContext();
  const [formData, setFormData] = useState({
    sticker_type_id: '',
    quantity: '',
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
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      // For license, allow max 2 files (front and back)
      if (uploadType === 'license') {
        const existingLicenseFiles = attachments.filter(att => att.uploadType === 'license');
        const availableSlots = 2 - existingLicenseFiles.length;
        
        if (availableSlots <= 0) {
          setSubmitError('Maximum 2 license files allowed (front and back)');
          return;
        }

        const filesToAdd = files.slice(0, availableSlots);
        
        filesToAdd.forEach(file => {
          setAttachments(prev => [
            ...prev,
            { file, uploadType, name: file.name }
          ]);
        });

        if (files.length > availableSlots) {
          setSubmitError(`Only ${availableSlots} more license file(s) can be added`);
        } else {
          setSubmitError(null);
        }
      } else {
        // For other documents, allow only one file
        const existingFile = attachments.find(att => att.uploadType === uploadType);
        if (existingFile) {
          // Replace existing file
          setAttachments(prev => prev.map(att => 
            att.uploadType === uploadType 
              ? { file: files[0], uploadType, name: files[0].name }
              : att
          ));
        } else {
          setAttachments(prev => [
            ...prev,
            { file: files[0], uploadType, name: files[0].name }
          ]);
        }
        setSubmitError(null);
      }

      // Clear the input
      e.target.value = '';
    } catch (err) {
      setSubmitError('Failed to prepare file for upload');
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setSubmitError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setFormSubmitting(true);

    // Validate attachments
    const licenseFiles = attachments.filter(att => att.uploadType === 'license');
    const officialReceiptFiles = attachments.filter(att => att.uploadType === 'official_receipt');
    const certFiles = attachments.filter(att => att.uploadType === 'certificate_of_registration');

    if (licenseFiles.length === 0) {
      setSubmitError('Please upload at least one license file');
      setFormSubmitting(false);
      return;
    }

    if (officialReceiptFiles.length === 0) {
      setSubmitError('Please upload the official receipt');
      setFormSubmitting(false);
      return;
    }

    if (certFiles.length === 0) {
      setSubmitError('Please upload the certificate of registration');
      setFormSubmitting(false);
      return;
    }

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
        quantity: '',
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
          <h3>Vehicle Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="vehicle_registration">Plate Number</label>
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

        <div className="form-section">
          <h3>Required Documents</h3>
          <p className="section-description">Please upload the following documents (PDF, JPG, or PNG format)</p>
          
          <div className="upload-group">
            <div className="upload-field">
              <label>License (Back to Back) * (Max 2 files)</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileSelect(e, 'license')}
                multiple
              />
              <p className="help-text">Driver's license front and back (upload up to 2 files)</p>
            </div>

            <div className="upload-field">
              <label>Official Receipt *</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileSelect(e, 'official_receipt')}
                required
              />
              <p className="help-text">Official receipt of vehicle registration</p>
            </div>

            <div className="upload-field">
              <label>Certificate of Registration *</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileSelect(e, 'certificate_of_registration')}
                required
              />
              <p className="help-text">Vehicle certificate of registration</p>
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="attachments-list">
              <h4>Attached Files:</h4>
              {attachments.map((att, idx) => (
                <div key={idx} className="attachment-item">
                  <span>{att.name} ({att.uploadType.replace(/_/g, ' ')})</span>
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
