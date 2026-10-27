import { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import Toast from '../../components/Toast';
import ConfirmationModal from '../../components/ConfirmationModal';
import { 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function StaffIdRequests() {
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [confirmation, setConfirmation] = useState({ show: false, message: '', onConfirm: null });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cardsRes, studentsRes] = await Promise.all([
        apiRequest('/student-id-cards'),
        apiRequest('/students')
      ]);
      
      // Only get requested cards (pending approval)
      const pendingRequests = (cardsRes.data || []).filter(card => card.status === 'requested');
      setRequests(pendingRequests);
      
      // Get students without any ID card
      const studentsWithCards = (cardsRes.data || []).map(c => c.student_id);
      const studentsWithoutCards = (studentsRes.data || []).filter(
        s => !studentsWithCards.includes(s.id) && s.photo_path
      );
      setStudents(studentsWithoutCards);
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 5000);
  };

  const createRequest = async (studentId) => {
    setConfirmation({
      show: true,
      message: 'Create ID card request for this student?',
      onConfirm: async () => {
        setConfirmation({ show: false, message: '', onConfirm: null });
        try {
          setProcessing(true);
          await apiRequest(`/students/${studentId}/id-card-request`, { method: 'POST' });
          showNotification('ID card request created successfully!', 'success');
          await loadData();
        } catch (error) {
          showNotification(error.message || 'Failed to create request', 'error');
        } finally {
          setProcessing(false);
        }
      }
    });
  };

  const approveRequest = async (cardId) => {
    setConfirmation({
      show: true,
      message: 'Approve this ID card request?',
      onConfirm: async () => {
        setConfirmation({ show: false, message: '', onConfirm: null });
        try {
          setProcessing(true);
          const expiry = new Date();
          expiry.setFullYear(expiry.getFullYear() + 3);
          
          await apiRequest(`/student-id-cards/${cardId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({
              status: 'approved',
              expiry_date: expiry.toISOString().split('T')[0],
              notes: 'Request approved - ready for printing'
            })
          });
          
          showNotification('Request approved successfully!', 'success');
          await loadData();
        } catch (error) {
          showNotification(error.message || 'Failed to approve request', 'error');
        } finally {
          setProcessing(false);
        }
      }
    });
  };

  const rejectRequest = async (cardId) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;
    
    setConfirmation({
      show: true,
      message: 'Reject this ID card request?',
      confirmColor: 'red',
      onConfirm: async () => {
        setConfirmation({ show: false, message: '', onConfirm: null });
        try {
          setProcessing(true);
          await apiRequest(`/student-id-cards/${cardId}`, { method: 'DELETE' });
          showNotification('Request rejected successfully', 'success');
          await loadData();
        } catch (error) {
          showNotification(error.message || 'Failed to reject request', 'error');
        } finally {
          setProcessing(false);
        }
      }
    });
  };

  const filteredRequests = requests.filter(req => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      req.student?.first_name?.toLowerCase().includes(term) ||
      req.student?.last_name?.toLowerCase().includes(term) ||
      req.student?.student_id_number?.toLowerCase().includes(term) ||
      req.card_number?.toLowerCase().includes(term)
    );
  });

  const filteredStudents = students.filter(student => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      student.first_name?.toLowerCase().includes(term) ||
      student.last_name?.toLowerCase().includes(term) ||
      student.student_id_number?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification.show && (
        <Toast 
          type={notification.type} 
          message={notification.message} 
          onClose={() => setNotification({ show: false, type: '', message: '' })} 
        />
      )}

      {/* Confirmation Modal */}
      {confirmation.show && (
        <ConfirmationModal
          message={confirmation.message}
          confirmColor={confirmation.confirmColor}
          onConfirm={confirmation.onConfirm}
          onCancel={() => setConfirmation({ show: false, message: '', onConfirm: null })}
        />
      )}

      {/* Header Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ID Card Requests</h1>
            <p className="text-sm text-gray-500 mt-1">Review and approve new ID card requests</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-600">{requests.length}</div>
              <div className="text-xs text-gray-500">Pending Approval</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{students.length}</div>
              <div className="text-xs text-gray-500">Ready to Request</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name, number, or card number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Pending Requests */}
      {filteredRequests.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-amber-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ClockIcon className="w-5 h-5 mr-2 text-amber-600" />
              Pending Approval ({filteredRequests.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {filteredRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Photo */}
                    <div className="flex-shrink-0">
                      {request.student?.photo_url ? (
                        <img 
                          src={request.student.photo_url} 
                          alt={request.student.full_name}
                          className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-gray-200 flex items-center justify-center">
                          <UserCircleIcon className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {request.student?.full_name}
                      </h3>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <DocumentTextIcon className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="font-medium">Student ID:</span>
                          <span className="ml-2">{request.student?.student_id_number}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DocumentTextIcon className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="font-medium">Card Number:</span>
                          <span className="ml-2 font-mono text-xs">{request.card_number}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="font-medium">Requested:</span>
                          <span className="ml-2">{new Date(request.requested_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="font-medium">Program:</span>
                          <span className="ml-2">{request.student?.program}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                          Year {request.student?.year_level}
                        </span>
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                          {request.student?.section}
                        </span>
                        <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                          {request.student?.department}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => approveRequest(request.id)}
                      disabled={processing}
                      className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      Approve
                    </button>
                    <button
                      onClick={() => rejectRequest(request.id)}
                      disabled={processing}
                      className="px-6 py-2.5 bg-white border-2 border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <XCircleIcon className="w-5 h-5" />
                      Reject
                    </button>
                    <button
                      onClick={() => setShowDetails(request)}
                      className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Students Ready to Request */}
      {filteredStudents.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-blue-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <UserCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
              Students Ready for ID Cards ({filteredStudents.length})
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredStudents.map((student) => (
                <div key={student.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
                  <div className="flex flex-col items-center text-center">
                    {student.photo_url ? (
                      <img 
                        src={student.photo_url} 
                        alt={student.full_name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-emerald-200 mb-3"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                        <UserCircleIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <h3 className="font-semibold text-gray-900 mb-1">{student.full_name}</h3>
                    <p className="text-xs text-gray-500 mb-1">{student.student_id_number}</p>
                    <p className="text-xs text-gray-600 mb-3">{student.program}</p>
                    <button
                      onClick={() => createRequest(student.id)}
                      disabled={processing}
                      className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty States */}
      {filteredRequests.length === 0 && filteredStudents.length === 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <CheckCircleIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending requests</h3>
          <p className="text-sm text-gray-500">All ID card requests have been processed</p>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowDetails(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">Request Details</h3>
              <button onClick={() => setShowDetails(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Student Name</label>
                  <p className="text-base text-gray-900 font-medium">{showDetails.student?.full_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Student ID Number</label>
                  <p className="text-base text-gray-900 font-medium">{showDetails.student?.student_id_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Card Number</label>
                  <p className="text-base font-mono text-gray-900">{showDetails.card_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Status</label>
                  <p className="text-base text-gray-900 capitalize">{showDetails.status}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Program</label>
                  <p className="text-base text-gray-900">{showDetails.student?.program}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Year & Section</label>
                  <p className="text-base text-gray-900">Year {showDetails.student?.year_level} - {showDetails.student?.section}</p>
                </div>
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-500 mb-2">Requested Date</label>
                  <p className="text-base text-gray-900">{new Date(showDetails.requested_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowDetails(null)}
                className="px-6 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
