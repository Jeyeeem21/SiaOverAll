import { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import RoleSwitcher from '../components/RoleSwitcher';
import Toast from '../components/Toast';

const API_BASE_URL = 'http://localhost:8000';

export default function IdRequests() {
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showPreview, setShowPreview] = useState(null);
  const [showRelease, setShowRelease] = useState(null);
  const [releaseData, setReleaseData] = useState({ recipient_name: '', notes: '' });
  const [showStudentSearch, setShowStudentSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState(false);

  const canManage = ['Admin', 'Staff'].includes(currentUser?.role);

  useEffect(() => {
    let active = true;
    apiRequest('/user').then((user) => { if (active) setCurrentUser(user) }).catch(() => { if (active) setCurrentUser(null) });
    return () => { active = false };
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [requestsRes, studentsRes] = await Promise.all([
        apiRequest('/student-id-cards'),
        apiRequest('/students')
      ]);
      setRequests(requestsRes.data || []);
      setStudents(studentsRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createRequest(studentId) {
    try {
      setProcessing(true);
      setError('');
      await apiRequest(`/students/${studentId}/id-card-request`, { method: 'POST' });
      setNotice('ID card request created successfully!');
      setShowStudentSearch(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  async function approveRequest(cardId) {
    if (!window.confirm('Approve this ID card request?')) return;
    
    try {
      setProcessing(true);
      setError('');
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 3); // 3 years expiry
      
      await apiRequest(`/student-id-cards/${cardId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'approved',
          expiry_date: expiry.toISOString().split('T')[0],
          notes: 'ID card approved by staff'
        })
      });
      setNotice('ID card request approved!');
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  async function markAsPrinted(cardId) {
    try {
      setProcessing(true);
      setError('');
      await apiRequest(`/student-id-cards/${cardId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'printed',
          notes: 'ID card printed'
        })
      });
      setNotice('ID card marked as printed!');
      setShowPreview(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  async function releaseId(cardId) {
    if (!releaseData.recipient_name.trim()) {
      setError('Please enter recipient name');
      return;
    }

    try {
      setProcessing(true);
      setError('');
      await apiRequest(`/student-id-cards/${cardId}/release`, {
        method: 'POST',
        body: JSON.stringify(releaseData)
      });
      setNotice('ID card released successfully!');
      setShowRelease(null);
      setReleaseData({ recipient_name: '', notes: '' });
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  const filteredStudents = students.filter(s => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return s.first_name?.toLowerCase().includes(term) ||
           s.last_name?.toLowerCase().includes(term) ||
           s.student_id_number?.toLowerCase().includes(term);
  });

  const studentsWithoutActiveRequest = filteredStudents.filter(student => 
    !requests.some(req => req.student_id === student.id && ['requested', 'approved', 'printed'].includes(req.status))
  );

  const getStatusConfig = (status) => {
    const configs = {
      requested: { label: 'Requested', color: 'bg-blue-100 text-blue-800', icon: '📋' },
      approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: '✅' },
      printed: { label: 'Printed', color: 'bg-purple-100 text-purple-800', icon: '🖨️' },
      released: { label: 'Released', color: 'bg-emerald-100 text-emerald-800', icon: '✓' },
    };
    return configs[status] || configs.requested;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <span className="text-xl font-semibold text-gray-800">Student Portal</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900">{currentUser?.full_name || 'User'}</div>
                <div className="text-xs text-gray-500">{currentUser?.role || 'Role'}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold shadow-sm">
                {currentUser?.full_name?.[0] || 'U'}
              </div>
            </div>
          </div>
          <div className="flex space-x-1 -mb-px overflow-x-auto">
            <button onClick={() => window.location.href = '/'} className="px-4 lg:px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300 transition-colors whitespace-nowrap">
              Students
            </button>
            <button onClick={() => window.location.href = '/id-cards'} className="px-4 lg:px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300 transition-colors whitespace-nowrap">
              ID Cards
            </button>
            <button className="px-4 lg:px-6 py-3 text-sm font-medium text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50 whitespace-nowrap">
              ID Requests
            </button>
            <button onClick={() => window.location.href = '/release-history'} className="px-4 lg:px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300 transition-colors whitespace-nowrap">
              Release History
            </button>
            <button onClick={() => window.location.href = '/documents'} className="px-4 lg:px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300 transition-colors whitespace-nowrap">
              Documents
            </button>
            <button onClick={() => window.location.href = '/staff'} className="px-4 lg:px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300 transition-colors whitespace-nowrap">
              Staff
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 lg:px-8 py-6 lg:py-8 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">ID Requests</h1>
              <p className="text-sm text-gray-500 mt-2">Manage student ID card requests from creation to release</p>
            </div>
            {canManage && (
              <button onClick={() => setShowStudentSearch(true)} className="flex items-center justify-center px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-all shadow-sm whitespace-nowrap">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                New ID Request
              </button>
            )}
          </div>

          {/* Alerts */}
          <Toast type="error" message={error} onClose={() => setError('')} />
          <Toast type="success" message={notice} onClose={() => setNotice('')} />

          {/* Requests List */}
          <div className="p-6 lg:p-8">
            {requests.length === 0 ? (
              <div className="text-center py-20">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No ID requests yet</h3>
                <p className="mt-2 text-sm text-gray-500">Get started by creating a new ID request for a student.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {requests.map((request) => {
                  const config = getStatusConfig(request.status);
                  return (
                    <div key={request.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Student Photo */}
                        <div className="flex-shrink-0">
                          {request.student?.photo_url ? (
                            <img src={request.student.photo_url} alt={request.student.full_name} className="w-24 h-24 rounded-xl object-cover border-2 border-emerald-100" />
                          ) : (
                            <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-400">
                              {request.student?.first_name?.[0]}{request.student?.last_name?.[0]}
                            </div>
                          )}
                        </div>

                        {/* Student Information */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{request.student?.full_name}</h3>
                              <p className="text-sm text-gray-500 mt-1">{request.card_number}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                              <span>{config.icon}</span>
                              {config.label}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                            <div>
                              <span className="text-gray-500">Student ID:</span>
                              <p className="font-medium text-gray-900">{request.student?.student_id_number}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Program:</span>
                              <p className="font-medium text-gray-900">{request.student?.program}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Year Level:</span>
                              <p className="font-medium text-gray-900">Year {request.student?.year_level}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Requested:</span>
                              <p className="font-medium text-gray-900">{new Date(request.requested_at).toLocaleDateString()}</p>
                            </div>
                          </div>

                          {/* Actions */}
                          {canManage && (
                            <div className="flex flex-wrap gap-2">
                              {request.status === 'requested' && (
                                <button onClick={() => approveRequest(request.id)} disabled={processing} className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50">
                                  ✓ Approve
                                </button>
                              )}
                              {request.status === 'approved' && (
                                <button onClick={() => setShowPreview(request)} className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors">
                                  🖨️ Generate ID
                                </button>
                              )}
                              {request.status === 'printed' && (
                                <button onClick={() => setShowRelease(request)} className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors">
                                  ✓ Release ID
                                </button>
                              )}
                              <button onClick={() => window.open(`${API_BASE_URL}/storage/${request.student?.photo_path}`, '_blank')} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                                📷 View Photo
                              </button>
                              {['approved', 'printed', 'released'].includes(request.status) && (
                                <a href={`${API_BASE_URL}/api/student-id-cards/${request.id}/pdf?role=${currentUser?.role}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
                                  📄 Download PDF
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Student Search Modal */}
      {showStudentSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowStudentSearch(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Search Student</h2>
              <button onClick={() => setShowStudentSearch(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8">
              <div className="mb-6">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or student ID number..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {studentsWithoutActiveRequest.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      {student.photo_url ? (
                        <img src={student.photo_url} alt={student.full_name} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-400">
                          {student.first_name?.[0]}{student.last_name?.[0]}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{student.full_name}</h3>
                        <p className="text-sm text-gray-500">{student.student_id_number} • {student.program}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => createRequest(student.id)}
                      disabled={processing || !student.photo_path}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {!student.photo_path ? 'No Photo' : 'Request ID'}
                    </button>
                  </div>
                ))}
                {studentsWithoutActiveRequest.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No students found or all have active requests</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ID Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50" onClick={() => setShowPreview(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-8" onClick={(e) => e.stopPropagation()}>
            <div className="px-8 py-6 mx-8 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">ID Card Preview</h2>
              <p className="text-sm text-gray-500 mt-1">Review before printing</p>
            </div>
            <div className="px-8 py-8 mx-8">
              {/* ID Card Preview - Plain White Background */}
              <div className="bg-white rounded-lg border-2 border-gray-200 p-8 mb-6">
                <div className="flex items-center space-x-6">
                  {showPreview.student?.photo_url && (
                    <img src={showPreview.student.photo_url} alt="" className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200" />
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{showPreview.student?.full_name}</h3>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p className="font-medium">{showPreview.card_number}</p>
                      <p>{showPreview.student?.program}</p>
                      <p>Year {showPreview.student?.year_level} • Section {showPreview.student?.section}</p>
                      <p className="text-xs mt-2 text-gray-600">Valid Until: {showPreview.expiry_date ? new Date(showPreview.expiry_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowPreview(null)} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Cancel
                </button>
                <button onClick={() => markAsPrinted(showPreview.id)} disabled={processing} className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50">
                  {processing ? 'Processing...' : 'Confirm & Print'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Release Modal */}
      {showRelease && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50" onClick={() => setShowRelease(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-8" onClick={(e) => e.stopPropagation()}>
            <div className="px-8 py-6 mx-8 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">Release ID Card</h2>
              <p className="text-sm text-gray-500 mt-1">Confirm student identity before releasing</p>
            </div>
            <div className="px-8 py-8 mx-8">
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-1">{showRelease.student?.full_name}</h3>
                <p className="text-sm text-gray-600">{showRelease.card_number}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Name (as shown on ID)</label>
                  <input
                    type="text"
                    value={releaseData.recipient_name}
                    onChange={(e) => setReleaseData({ ...releaseData, recipient_name: e.target.value })}
                    placeholder={showRelease.student?.full_name}
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                  <textarea
                    value={releaseData.notes}
                    onChange={(e) => setReleaseData({ ...releaseData, notes: e.target.value })}
                    rows="3"
                    placeholder="Any additional notes..."
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => { setShowRelease(null); setReleaseData({ recipient_name: '', notes: '' }); }} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Cancel
                </button>
                <button onClick={() => releaseId(showRelease.id)} disabled={processing} className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50">
                  {processing ? 'Processing...' : 'Confirm Release'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <RoleSwitcher currentUser={currentUser} />
    </div>
  );
}
