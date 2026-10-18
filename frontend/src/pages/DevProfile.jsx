import Navigation from '../components/Navigation';
import { ProfileSkeleton } from '../components/SkeletonLoader';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ApiService from '../services/api';

const DevProfile = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  
  // Form states
  const [editForm, setEditForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [verificationDocuments, setVerificationDocuments] = useState([]);
  const [uploadForm, setUploadForm] = useState({
    document_type: '',
    file: null
  });
  
  // Loading states for actions
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null); // { url, mime, name };
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profileData = await ApiService.getProfile();
        setProfile(profileData);
        setEditForm({
          full_name: profileData.name,
          phone: profileData.phone || profileData.contact_number || '',
          college: profileData.college,
          department: profileData.department,
          contact_number: profileData.contact_number || ''
        });

        // Fetch verification documents
        try {
          const documents = await ApiService.getStudentDocuments();
          setVerificationDocuments(documents || []);
        } catch (err) {
          console.warn('Could not load verification documents:', err.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (showEditModal) setShowEditModal(false);
        if (showPasswordModal) setShowPasswordModal(false);
        if (showVerificationModal) setShowVerificationModal(false);
        if (showNotificationsModal) setShowNotificationsModal(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showEditModal, showPasswordModal, showVerificationModal, showNotificationsModal]);
  // Handle document verification
  const handleVerification = () => {
    setShowVerificationModal(true);
    setUploadForm({
      document_type: '',
      file: null
    });
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      alert('Please select a file');
      return;
    }

    if (!uploadForm.document_type) {
      alert('Please select document type');
      return;
    }

    try {
      setUploadingDocument(true);
      
      const formData = new FormData();
      formData.append('document_type', uploadForm.document_type);
      formData.append('file', uploadForm.file);
      
      await ApiService.uploadVerificationDocument(formData);
      
      // Refresh verification documents
      const updatedDocs = await ApiService.getStudentDocuments();
      setVerificationDocuments(updatedDocs || []);
      
      setShowVerificationModal(false);
      alert('Document uploaded successfully!');
    } catch (err) {
      alert('Error uploading document: ' + err.message);
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadForm(prev => ({
      ...prev,
      file: file
    }));
  };

  // Handle edit profile
  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await ApiService.updateProfile(editForm);
      
      // Refresh profile data
      const updatedProfile = await ApiService.getProfile();
      setProfile(updatedProfile);
      setShowEditModal(false);
      
      // Show success message (you can add a toast notification here)
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Handle change password
  const handleChangePassword = () => {
    setShowPasswordModal(true);
    setPasswordForm({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert('New password and confirmation do not match');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    try {
      setChangingPassword(true);
      await ApiService.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      
      setShowPasswordModal(false);
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      alert('Password changed successfully!');
    } catch (err) {
      alert('Error changing password: ' + err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle view notifications
  const handleViewNotifications = async () => {
    try {
      setLoadingNotifications(true);
      setShowNotificationsModal(true);
      const data = await ApiService.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      alert('Error loading notifications: ' + err.message);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await ApiService.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => ApiService.markNotificationRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Handle form changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get user initials
  const getUserInitials = (name) => {
    if (!name) return 'N/A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <>
        <Navigation userRole="student" />
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
          <main className="pt-6 sm:pt-8 main-content">
            <div className="container-responsive space-responsive">
              <ProfileSkeleton />
            </div>
          </main>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation userRole="student" />
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-lg font-medium mb-2">Error Loading Profile</div>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation userRole="student" />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
        <main className="pt-6 sm:pt-8 main-content">
          <div className="container-responsive space-responsive">
            {/* Profile Header */}
            <div className="text-center mb-6 sm:mb-8">
              {/* Avatar */}
              <div className="relative inline-block mb-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gradient-to-r from-indigo-600 to-indigo-700 flex items-center justify-center mx-auto ring-4 ring-white shadow-lg">
                  {profile?.avatar ? (
                    <img
                      src={`http://localhost:3002/${profile.avatar}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-xl sm:text-2xl">
                      {getUserInitials(profile?.name)}
                    </span>
                  )}
                </div>
                {/* Camera button */}
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center cursor-pointer shadow transition"
                  title="Change photo"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      try {
                        const result = await ApiService.uploadAvatar(file);
                        // Refresh profile to get new avatar
                        const updated = await ApiService.getProfile();
                        setProfile(updated);
                      } catch (err) {
                        alert('Failed to upload photo: ' + err.message);
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
              <h1 className="text-responsive-2xl font-bold text-gray-900">{profile?.name || 'N/A'}</h1>
              <p className="text-responsive-sm text-gray-600 mt-2">
                {profile?.student_number || 'N/A'} • {profile?.department || 'N/A'}
              </p>
              <div className="flex items-center justify-center mt-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(profile?.student_status)}`}>
                  {profile?.student_status || 'unknown'}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid-responsive-4 gap-responsive">
              <button onClick={handleEditProfile} className="card card-md animate-fade-in hover:shadow-md transition-shadow">
                <div className="text-center">
                  <svg className="mx-auto w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <p className="text-responsive-xs sm:text-responsive-sm font-medium text-gray-900">Edit Profile</p>
                </div>
              </button>
              
              <button onClick={handleChangePassword} className="card card-md animate-fade-in hover:shadow-md transition-shadow" style={{animationDelay: '0.1s'}}>
                <div className="text-center">
                  <svg className="mx-auto w-6 h-6 sm:w-8 sm:h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-responsive-xs sm:text-responsive-sm font-medium text-gray-900">Security</p>
                </div>
              </button>
              
              <button onClick={handleVerification} className="card card-md animate-fade-in hover:shadow-md transition-shadow" style={{animationDelay: '0.2s'}}>
                <div className="text-center">
                  <svg className="mx-auto w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-responsive-xs sm:text-responsive-sm font-medium text-gray-900">Verification</p>
                </div>
              </button>
            </div>

            {/* Personal Information */}
            <div className="card animate-slide-up">
              <div className="header-responsive border-b border-gray-200">
                <h2 className="text-responsive-xl font-semibold text-gray-900">Personal Information</h2>
              </div>
              <div className="card-md">
                <div className="grid-responsive-2 gap-responsive">
                  <div>
                    <label className="text-responsive-xs font-medium text-gray-500">Full Name</label>
                    <p className="mt-1 text-responsive-sm text-gray-900">{profile?.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-responsive-xs font-medium text-gray-500">Email Address</label>
                    <p className="mt-1 text-responsive-sm text-gray-900 truncate">{profile?.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-responsive-xs font-medium text-gray-500">Student ID</label>
                    <p className="mt-1 text-responsive-sm text-gray-900">{profile?.student_number || 'Not assigned'}</p>
                  </div>
                  <div>
                    <label className="text-responsive-xs font-medium text-gray-500">Phone Number</label>
                    <p className="mt-1 text-responsive-sm text-gray-900">{profile?.contact_number || profile?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-responsive-xs font-medium text-gray-500">Reference Number</label>
                    <p className="mt-1 text-responsive-sm text-gray-900">{profile?.reference_no || 'Not assigned'}</p>
                  </div>
                  <div>
                    <label className="text-responsive-xs font-medium text-gray-500">Account Status</label>
                    <p className="mt-1 text-responsive-sm text-gray-900">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${profile?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {profile?.status || 'unknown'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-responsive-xs font-medium text-gray-500">Email Verified</label>
                    <p className="mt-1 text-responsive-sm text-gray-900">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${profile?.email_verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {profile?.email_verified ? 'Verified' : 'Not Verified'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-responsive-xs font-medium text-gray-500">Member Since</label>
                    <p className="mt-1 text-responsive-sm text-gray-900">{formatDate(profile?.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="card animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="header-responsive border-b border-gray-200">
                <h2 className="text-responsive-xl font-semibold text-gray-900">Academic Information</h2>
              </div>
              <div className="card-md">
                <div className="grid-responsive-2 gap-responsive">
                  <div>
                    <label className="text-responsive-xs font-medium text-gray-500">College</label>
                    <p className="mt-1 text-responsive-sm text-gray-900">{profile?.college || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-responsive-xs font-medium text-gray-500">Department/Program</label>
                    <p className="mt-1 text-responsive-sm text-gray-900">{profile?.department || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-responsive-xs font-medium text-gray-500">Verification Status</label>
                    <p className="mt-1 text-responsive-sm text-gray-900">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(profile?.student_status)}`}>
                        {profile?.student_status || 'unknown'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-responsive-xs font-medium text-gray-500">Registration Date</label>
                    <p className="mt-1 text-responsive-sm text-gray-900">{formatDate(profile?.student_created_at)}</p>
                  </div>
                  {profile?.verified_at && (
                    <div>
                      <label className="text-responsive-xs font-medium text-gray-500">Verified Date</label>
                      <p className="mt-1 text-responsive-sm text-gray-900">{formatDate(profile?.verified_at)}</p>
                    </div>
                  )}
                  {profile?.verified_by && (
                    <div>
                      <label className="text-responsive-xs font-medium text-gray-500">Verified By</label>
                      <p className="mt-1 text-responsive-sm text-gray-900">Staff ID: {profile?.verified_by}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Documents */}
            <div className="card animate-slide-up" style={{animationDelay: '0.15s'}}>
              <div className="header-responsive border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-responsive-xl font-semibold text-gray-900">Verification Documents</h2>
                  <button 
                    onClick={handleVerification}
                    className="btn-primary btn-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Upload Document
                  </button>
                </div>
              </div>
              <div className="card-md">
                {verificationDocuments.length > 0 ? (
                  <div className="space-y-4">
                    {verificationDocuments.map((doc, index) => {
                      const fileUrl = doc.file_path
                        ? `http://localhost:3002/${doc.file_path.replace(/\\/g, '/')}`
                        : null;

                      // Only these are natively previewable in browser
                      const browserImages = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
                      const isPreviewableImage = browserImages.includes(doc.mime);
                      const isPdf = doc.mime === 'application/pdf';
                      const canPreview = isPreviewableImage || isPdf;

                      return (
                        <div key={doc.id || index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-responsive-sm font-medium text-gray-900 truncate">{doc.original_name || doc.document_type}</p>
                                <p className="text-responsive-xs text-gray-500">
                                  {doc.document_type} • Uploaded {formatDate(doc.created_at)}
                                </p>
                                {doc.reviewer_note && (
                                  <p className="text-responsive-xs text-gray-600 mt-1">Note: {doc.reviewer_note}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                                doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {doc.status}
                              </span>
                              {fileUrl && canPreview && (
                                <button
                                  onClick={() => setPreviewDoc({ url: fileUrl, mime: doc.mime, name: doc.original_name || doc.document_type })}
                                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  View
                                </button>
                              )}
                              {fileUrl && !canPreview && (
                                <a
                                  href={fileUrl}
                                  download
                                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-full hover:bg-gray-200 transition"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Download
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-responsive-sm text-gray-500 mb-2">No verification documents uploaded</p>
                    <p className="text-responsive-xs text-gray-400">Upload your ID or other verification documents to complete your profile</p>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Status */}
            <div className="card animate-slide-up" style={{animationDelay: '0.18s'}}>
              <div className="header-responsive border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-responsive-xl font-semibold text-gray-900">Verification Status</h2>
                  <div className="flex items-center space-x-2">
                    {profile?.student_status === 'approved' ? (
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : profile?.student_status === 'rejected' ? (
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(profile?.student_status)}`}>
                      {profile?.student_status ? profile.student_status.charAt(0).toUpperCase() + profile.student_status.slice(1) : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="card-md">
                {profile?.student_status === 'pending' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Verification In Progress</strong> — Your documents are being reviewed. This typically takes 1–2 business days.
                    </p>
                  </div>
                )}
                {profile?.student_status === 'approved' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      <strong>Account Verified ✓</strong> — Your student account has been successfully verified. You have full access to all services.
                    </p>
                  </div>
                )}
                {profile?.student_status === 'rejected' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800 mb-3">
                      <strong>Verification Rejected</strong> — Your submitted documents could not be verified. Please upload new documents.
                    </p>
                    <button onClick={handleVerification} className="btn-primary btn-sm">
                      Resubmit Documents
                    </button>
                  </div>
                )}

                {/* Requirements */}
                <div className="mt-4 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">Requirements</h3>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 font-semibold text-xs">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">School ID <span className="text-red-500">*</span></p>
                      <p className="text-xs text-gray-500">Clear photo showing your name, student number, and photo.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 font-semibold text-xs">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Registration Form <span className="text-red-500">*</span></p>
                      <p className="text-xs text-gray-500">Official registration form for the current semester.</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                    <p className="text-xs text-blue-700">Accepted formats: JPG, PNG, PDF • Max 10MB per file • All text must be readable</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div className="card animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="header-responsive border-b border-gray-200">
                <h2 className="text-responsive-xl font-semibold text-gray-900">Account Security</h2>
              </div>
              <div className="card-md space-responsive">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-responsive-sm font-medium text-gray-900">Password</h3>
                    <p className="text-responsive-xs text-gray-500">Last changed: {formatDate(profile?.updated_at)}</p>
                  </div>
                  <button onClick={handleChangePassword} className="btn-secondary btn-sm w-full sm:w-auto">Change Password</button>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-responsive-sm font-medium text-gray-900">Last Login</h3>
                    <p className="text-responsive-xs text-gray-500">{formatDate(profile?.last_login) || 'Not available'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={editForm.full_name || ''}
                    onChange={handleEditFormChange}
                    className="input w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone || ''}
                    onChange={handleEditFormChange}
                    className="input w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
                  <input
                    type="text"
                    name="college"
                    value={editForm.college || ''}
                    onChange={handleEditFormChange}
                    className="input w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={editForm.department || ''}
                    onChange={handleEditFormChange}
                    className="input w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input
                    type="tel"
                    name="contact_number"
                    value={editForm.contact_number || ''}
                    onChange={handleEditFormChange}
                    className="input w-full"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="btn-secondary flex-1"
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    name="current_password"
                    value={passwordForm.current_password}
                    onChange={handlePasswordFormChange}
                    className="input w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    name="new_password"
                    value={passwordForm.new_password}
                    onChange={handlePasswordFormChange}
                    className="input w-full"
                    minLength="6"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={passwordForm.confirm_password}
                    onChange={handlePasswordFormChange}
                    className="input w-full"
                    minLength="6"
                    required
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="btn-secondary flex-1"
                    disabled={changingPassword}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={changingPassword}
                  >
                    {changingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNotificationsModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Notifications</h3>
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {notifications.filter(n => !n.is_read).length} unread
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition"
                  >
                    Mark all as read
                  </button>
                )}
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {loadingNotifications ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">No notifications yet</p>
                  <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {notifications.map((notif) => {
                    const typeConfig = {
                      verification_update: { color: 'bg-blue-100 text-blue-600',   icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                      document_approved:   { color: 'bg-green-100 text-green-600', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                      document_rejected:   { color: 'bg-red-100 text-red-600',     icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
                      order_update:        { color: 'bg-purple-100 text-purple-600', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
                      payment_reminder:    { color: 'bg-yellow-100 text-yellow-600', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                      system_announcement: { color: 'bg-gray-100 text-gray-600',   icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
                    };
                    const cfg = typeConfig[notif.type] || { color: 'bg-gray-100 text-gray-600', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' };

                    return (
                      <li
                        key={notif.id}
                        className={`flex gap-3 px-5 py-4 transition ${!notif.is_read ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}`}
                      >
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${cfg.color}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cfg.icon} />
                          </svg>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className={`text-sm font-semibold truncate ${!notif.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notif.is_important && <span className="text-red-500 mr-1">●</span>}
                                {notif.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                            </div>
                            {!notif.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notif.id)}
                                className="flex-shrink-0 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition whitespace-nowrap"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{notif.time_ago}</p>
                        </div>

                        {/* Unread dot */}
                        {!notif.is_read && (
                          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-500 mt-2" />
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100">
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="w-full py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upload Verification Document</h3>
                <button
                  onClick={() => setShowVerificationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleUploadDocument} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                  <select
                    value={uploadForm.document_type}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, document_type: e.target.value }))}
                    className="input w-full"
                    required
                  >
                    <option value="">Select document type</option>
                    <option value="student_id">Student ID</option>
                    <option value="school_id">School ID</option>
                    <option value="national_id">National ID</option>
                    <option value="drivers_license">Driver's License</option>
                    <option value="passport">Passport</option>
                    <option value="birth_certificate">Birth Certificate</option>
                    <option value="enrollment_certificate">Certificate of Enrollment</option>
                    <option value="grade_report">Grade Report</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.doc,.docx"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Accepted formats: JPG, PNG, PDF, DOC, DOCX (Max: 5MB)
                  </p>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowVerificationModal(false)}
                    className="btn-secondary flex-1"
                    disabled={uploadingDocument}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={uploadingDocument}
                  >
                    {uploadingDocument ? 'Uploading...' : 'Upload Document'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70" onClick={() => setPreviewDoc(null)} />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Document Preview</p>
                <h3 className="text-sm font-semibold text-gray-900 truncate mt-0.5">{previewDoc.name}</h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="ml-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center p-4">
              {previewDoc.mime && ['image/jpeg','image/png','image/gif','image/webp','image/svg+xml'].includes(previewDoc.mime) ? (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.name}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow"
                />
              ) : previewDoc.mime === 'application/pdf' ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.name}
                  className="w-full rounded-lg"
                  style={{ height: '70vh' }}
                />
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 text-sm mb-3">Preview not available for this file type.</p>
                  <a
                    href={previewDoc.url}
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DevProfile;