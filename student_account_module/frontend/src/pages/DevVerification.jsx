import { useState } from 'react';
import Navigation from '../components/Navigation';
import Modal from '../components/Modal';

const DevVerification = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, verified, rejected, suspended
  
  // Student verification data - using Laravel field names
  const studentData = {
    name: 'Juan Cruz',
    student_number: '2024-0001',
    college: 'College of Computer Studies',
    department: 'Information Technology',
    contact_number: '+63 912 345 6789',
    email: 'juan.cruz@student.edu.ph',
    status: verificationStatus,
    created_at: '2024-01-15',
    documents: [
      { 
        id: 1, 
        original_name: 'School ID Front.jpg', 
        document_type: 'school_id', 
        status: 'approved', 
        created_at: '2024-01-15', 
        size: 2400000, // 2.3 MB in bytes
        file_path: '/uploads/school-id-front.jpg',
        mime: 'image/jpeg',
        rejection_reason: null,
        reviewer_note: null,
        reviewed_by: null,
        reviewed_at: null
      },
      { 
        id: 2, 
        original_name: 'Registration Form.pdf', 
        document_type: 'registration_form', 
        status: 'pending', 
        created_at: '2024-01-16', 
        size: 1890000, // 1.8 MB in bytes
        file_path: '/uploads/registration-form.pdf',
        mime: 'application/pdf',
        rejection_reason: null,
        reviewer_note: null,
        reviewed_by: null,
        reviewed_at: null
      }
    ]
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'verified':
        return (
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'pending':
        return (
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'rejected':
        return (
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const simulateUpload = () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }
    
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setShowUploadModal(false);
            setSelectedFile(null);
            setUploadProgress(0);
            // You could refresh the document list here in a real app
          }, 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <>
      <Navigation userRole="student" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      
      <header className="bg-white shadow-lg">
        <div className="container-responsive">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-3 sm:space-y-0">
            <div>
              <h1 className="text-responsive-2xl font-bold text-gray-900">Account Verification</h1>
              <p className="mt-1 text-responsive-sm text-gray-600">Complete your student verification process</p>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusIcon(studentData.status)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(studentData.status)}`}>
                {studentData.status.charAt(0).toUpperCase() + studentData.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mt-6 sm:mt-8 main-content">
        <div className="container-responsive space-responsive">
          
          {/* Verification Status Card */}
          <div className="card card-md animate-fade-in">
            <div className="text-center">
              <div className="mb-4">
                {getStatusIcon(studentData.status)}
              </div>
              
              {studentData.status === 'pending' && (
                <>
                  <h3 className="text-responsive-xl font-semibold text-yellow-800 mb-2">
                    Verification In Progress
                  </h3>
                  <p className="text-responsive-sm text-gray-600 mb-4">
                    Your documents are being reviewed by our verification team. This typically takes 1-2 business days.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-responsive-xs text-yellow-800">
                      <strong>Submitted:</strong> {studentData.created_at} • <strong>Expected completion:</strong> Within 48 hours
                    </p>
                  </div>
                </>
              )}

              {studentData.status === 'verified' && (
                <>
                  <h3 className="text-responsive-xl font-semibold text-green-800 mb-2">
                    Account Verified ✓
                  </h3>
                  <p className="text-responsive-sm text-gray-600 mb-4">
                    Congratulations! Your student account has been successfully verified. You now have full access to all services.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-responsive-xs text-green-800">
                      You can now order official documents, transcripts, and access all student services.
                    </p>
                  </div>
                </>
              )}

              {studentData.status === 'rejected' && (
                <>
                  <h3 className="text-responsive-xl font-semibold text-red-800 mb-2">
                    Verification Rejected
                  </h3>
                  <p className="text-responsive-sm text-gray-600 mb-4">
                    Your submitted documents could not be verified. Please review the issues below and resubmit.
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                    <p className="text-responsive-xs text-red-800 mb-2"><strong>Reasons:</strong></p>
                    <ul className="text-responsive-xs text-red-700 list-disc list-inside space-y-1">
                      <li>School ID image is not clear - please submit a clearer photo</li>
                      <li>Student number on ID does not match the one provided</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="btn-primary btn-md mt-4 w-full sm:w-auto"
                  >
                    Resubmit Documents
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Student Profile Information */}
          <div className="card animate-slide-up">
            <div className="header-responsive border-b border-gray-200">
              <h2 className="text-responsive-xl font-semibold text-gray-900">Student Information</h2>
            </div>
            <div className="card-md">
              <div className="grid-responsive-2 gap-responsive">
                <div>
                  <label className="text-responsive-xs font-medium text-gray-500">Full Name</label>
                  <p className="mt-1 text-responsive-sm text-gray-900">{studentData.name}</p>
                </div>
                <div>
                  <label className="text-responsive-xs font-medium text-gray-500">Student Number</label>
                  <p className="mt-1 text-responsive-sm text-gray-900">{studentData.student_number}</p>
                </div>
                <div>
                  <label className="text-responsive-xs font-medium text-gray-500">College</label>
                  <p className="mt-1 text-responsive-sm text-gray-900">{studentData.college}</p>
                </div>
                <div>
                  <label className="text-responsive-xs font-medium text-gray-500">Department</label>
                  <p className="mt-1 text-responsive-sm text-gray-900">{studentData.department}</p>
                </div>
                <div>
                  <label className="text-responsive-xs font-medium text-gray-500">Contact Number</label>
                  <p className="mt-1 text-responsive-sm text-gray-900">{studentData.contact_number}</p>
                </div>
                <div>
                  <label className="text-responsive-xs font-medium text-gray-500">Email Address</label>
                  <p className="mt-1 text-responsive-sm text-gray-900 truncate">{studentData.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Submitted Documents */}
          <div className="card animate-slide-up">
            <div className="header-responsive border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <h2 className="text-responsive-xl font-semibold text-gray-900">Verification Documents</h2>
              {studentData.status !== 'verified' && (
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="btn-primary btn-sm w-full sm:w-auto"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Upload Document
                </button>
              )}
            </div>
            <div className="divide-y divide-gray-200">
              {studentData.documents.map((doc, index) => (
                <div key={doc.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-start space-x-3 sm:space-x-4 min-w-0 flex-1">
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-responsive-sm font-medium text-gray-900 truncate">{doc.original_name}</h3>
                        <p className="text-responsive-xs text-gray-500 mt-1">
                          {doc.document_type === 'school_id' ? 'School ID' : 'Registration Form'} • {(doc.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Uploaded {doc.created_at}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                        {doc.status === 'approved' ? 'Approved' : doc.status === 'pending' ? 'Under Review' : 'Rejected'}
                      </span>
                      <button className="btn-secondary btn-sm">
                        <svg className="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="hidden sm:inline">View</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {studentData.documents.length === 0 && (
                <div className="p-6 sm:p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-responsive-sm font-medium text-gray-900 mb-2">No documents uploaded</h3>
                  <p className="text-responsive-xs text-gray-500 mb-4">
                    Upload your School ID and Registration Form to start the verification process.
                  </p>
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="btn-primary btn-md"
                  >
                    Upload First Document
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Verification Requirements */}
          <div className="card animate-slide-up">
            <div className="header-responsive border-b border-gray-200">
              <h2 className="text-responsive-xl font-semibold text-gray-900">Verification Requirements</h2>
            </div>
            <div className="card-md">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="text-responsive-sm font-semibold text-gray-900">School ID (Required)</h3>
                    <p className="text-responsive-xs text-gray-600 mt-1">
                      Clear photo of your current school ID showing your name, student number, and photo. 
                      Both front and back sides may be required.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="text-responsive-sm font-semibold text-gray-900">Registration Form (Required)</h3>
                    <p className="text-responsive-xs text-gray-600 mt-1">
                      Official registration form for the current semester showing your enrolled subjects and student information.
                    </p>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-responsive-sm font-medium text-blue-800">Document Guidelines</h4>
                      <ul className="text-responsive-xs text-blue-700 mt-1 space-y-1">
                        <li>• Images should be clear and well-lit</li>
                        <li>• All text must be readable</li>
                        <li>• Accepted formats: JPG, PNG, PDF</li>
                        <li>• Maximum file size: 10MB per document</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      <Modal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Verification Document"
        size="md"
      >
        <div className="space-y-4 sm:space-y-6">
          {/* Document Type */}
          <div>
            <label className="block text-responsive-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <select className="input input-lg">
              <option>Select document type</option>
              <option>School ID (Front)</option>
              <option>School ID (Back)</option>
              <option>Registration Form</option>
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-responsive-sm font-medium text-gray-700 mb-2">
              Choose File
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex flex-col sm:flex-row text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Upload a file</span>
                    <input 
                      type="file" 
                      className="sr-only" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <p className="sm:pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, PDF up to 10MB
                </p>
              </div>
            </div>
            
            {selectedFile && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-responsive-sm text-gray-900 truncate">
                  Selected: {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div>
              <div className="flex justify-between text-sm text-gray-700 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {uploadProgress === 100 && (
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-green-800">Document uploaded successfully!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowUploadModal(false)}
              className="btn-secondary btn-md w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              onClick={simulateUpload}
              disabled={!selectedFile || uploadProgress > 0}
              className="btn-primary btn-md w-full sm:w-auto order-1 sm:order-2"
            >
              {uploadProgress > 0 ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </div>
      </Modal>
      
      </div>
    </>
  );
};

export default DevVerification;