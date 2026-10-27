import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  PrinterIcon, 
  CheckBadgeIcon,
  XCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = 'http://localhost:8000/api';

const STATUS_CONFIG = {
  requested: {
    label: 'Requested',
    color: 'bg-blue-100 text-blue-800',
    icon: ClockIcon,
    badge: 'bg-blue-500'
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircleIcon,
    badge: 'bg-green-500'
  },
  printed: {
    label: 'Printed',
    color: 'bg-purple-100 text-purple-800',
    icon: PrinterIcon,
    badge: 'bg-purple-500'
  },
  released: {
    label: 'Released',
    color: 'bg-emerald-100 text-emerald-800',
    icon: CheckBadgeIcon,
    badge: 'bg-emerald-500'
  },
  expired: {
    label: 'Expired',
    color: 'bg-red-100 text-red-800',
    icon: XCircleIcon,
    badge: 'bg-red-500'
  },
  replacement_requested: {
    label: 'Replacement Requested',
    color: 'bg-amber-100 text-amber-800',
    icon: ArrowPathIcon,
    badge: 'bg-amber-500'
  }
};

export default function IdRequestManagement() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCard, setSelectedCard] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState({ status: '', notes: '', expiry_date: '', replacement_reason: '' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/student-id-cards`);
      setCards(response.data.data || []);
    } catch (error) {
      console.error('Error fetching ID cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedCard || !statusUpdateData.status) return;

    try {
      setUpdating(true);
      await axios.patch(
        `${API_BASE_URL}/student-id-cards/${selectedCard.id}/status`,
        statusUpdateData
      );
      await fetchCards();
      setShowStatusModal(false);
      setSelectedCard(null);
      setStatusUpdateData({ status: '', notes: '', expiry_date: '', replacement_reason: '' });
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getValidTransitions = (currentStatus) => {
    const transitions = {
      requested: ['approved'],
      approved: ['printed', 'expired', 'replacement_requested'],
      printed: ['released', 'expired', 'replacement_requested'],
      released: ['expired', 'replacement_requested'],
      expired: ['replacement_requested'],
      replacement_requested: []
    };
    return transitions[currentStatus] || [];
  };

  const filteredCards = cards.filter(card => {
    const matchesSearch = 
      card.card_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.student?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.student?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.student?.student_id_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || card.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const StatusIcon = ({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.requested;
    const Icon = config.icon;
    return <Icon className="h-5 w-5" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading ID requests...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-50">
      {/* Top Navigation Bar - Matching other pages */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-10">
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
                <div className="text-sm font-medium text-gray-900">Admin User</div>
                <div className="text-xs text-gray-500">Administrator</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold">
                A
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 -mb-px overflow-x-auto">
            <button onClick={() => window.location.href = '/'} className="px-6 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 transition-colors whitespace-nowrap">
              Students
            </button>
            <button onClick={() => window.location.href = '/id-cards'} className="px-6 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 transition-colors whitespace-nowrap">
              ID Cards
            </button>
            <button onClick={() => window.location.href = '/id-requests'} className="px-6 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 transition-colors whitespace-nowrap">
              ID Requests
            </button>
            <button onClick={() => window.location.href = '/release-history'} className="px-6 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 transition-colors whitespace-nowrap">
              Release History
            </button>
            <button onClick={() => window.location.href = '/documents'} className="px-6 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 transition-colors whitespace-nowrap">
              Documents
            </button>
            <button className="px-6 py-3 text-sm font-medium text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50 whitespace-nowrap">
              ID Management
            </button>
            <button onClick={() => window.location.href = '/staff'} className="px-6 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 transition-colors whitespace-nowrap">
              Staff
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">ID Request Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage student ID card requests and status updates</p>
        </div>

        {/* Filters */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by card number, student name, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="requested">Requested</option>
              <option value="approved">Approved</option>
              <option value="printed">Printed</option>
              <option value="released">Released</option>
              <option value="expired">Expired</option>
              <option value="replacement_requested">Replacement Requested</option>
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => {
              const count = cards.filter(c => c.status === status).length;
              return (
                <div key={status} className="text-center bg-gray-50 rounded-xl p-4">
                  <div className={`inline-block p-2 rounded-full ${config.color} mb-2`}>
                    <StatusIcon status={status} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-xs text-gray-600">{config.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cards List */}
        <div className="px-8 pb-8">
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Card Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCards.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No ID requests found
                    </td>
                  </tr>
                ) : (
                  filteredCards.map((card) => {
                    const config = STATUS_CONFIG[card.status] || STATUS_CONFIG.requested;
                    const validTransitions = getValidTransitions(card.status);
                    
                    return (
                      <tr key={card.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{card.card_number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {card.student?.first_name} {card.student?.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {card.student?.student_id_number}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                            <StatusIcon status={card.status} />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(card.requested_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {card.expiry_date ? new Date(card.expiry_date).toLocaleDateString() : 'Not set'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCard(card);
                              setShowHistoryModal(true);
                            }}
                            className="text-emerald-600 hover:text-emerald-900"
                          >
                            History
                          </button>
                          {validTransitions.length > 0 && (
                            <button
                              onClick={() => {
                                setSelectedCard(card);
                                setStatusUpdateData({ status: '', notes: '', expiry_date: '', replacement_reason: '' });
                                setShowStatusModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Update Status
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Update Status</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Current Status: <span className="font-medium">{STATUS_CONFIG[selectedCard.status].label}</span>
              </p>
              <p className="text-sm text-gray-600">
                Student: <span className="font-medium">{selectedCard.student?.first_name} {selectedCard.student?.last_name}</span>
              </p>
            </div>

            <div className="space-y-4">
              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={statusUpdateData.status}
                  onChange={(e) => setStatusUpdateData({ ...statusUpdateData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select new status...</option>
                  {getValidTransitions(selectedCard.status).map((status) => (
                    <option key={status} value={status}>
                      {STATUS_CONFIG[status].label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Expiry Date (for approved/printed) */}
              {(statusUpdateData.status === 'approved' || statusUpdateData.status === 'printed') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={statusUpdateData.expiry_date}
                    onChange={(e) => setStatusUpdateData({ ...statusUpdateData, expiry_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Replacement Reason */}
              {statusUpdateData.status === 'replacement_requested' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Replacement Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={statusUpdateData.replacement_reason}
                    onChange={(e) => setStatusUpdateData({ ...statusUpdateData, replacement_reason: e.target.value })}
                    placeholder="Enter reason for replacement..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={statusUpdateData.notes}
                  onChange={(e) => setStatusUpdateData({ ...statusUpdateData, notes: e.target.value })}
                  placeholder="Add any additional notes..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedCard(null);
                  setStatusUpdateData({ status: '', notes: '', expiry_date: '', replacement_reason: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || !statusUpdateData.status || (statusUpdateData.status === 'replacement_requested' && !statusUpdateData.replacement_reason)}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Status History</h3>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Card:</span> {selectedCard.card_number}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Student:</span> {selectedCard.student?.first_name} {selectedCard.student?.last_name}
              </p>
              {selectedCard.expiry_date && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Expiry Date:</span> {new Date(selectedCard.expiry_date).toLocaleDateString()}
                </p>
              )}
              {selectedCard.replacement_reason && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Replacement Reason:</span> {selectedCard.replacement_reason}
                </p>
              )}
            </div>

            <div className="space-y-4">
              {selectedCard.history && selectedCard.history.length > 0 ? (
                selectedCard.history.map((entry, index) => {
                  const config = STATUS_CONFIG[entry.status] || STATUS_CONFIG.requested;
                  return (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full ${config.badge} flex items-center justify-center text-white`}>
                          <StatusIcon status={entry.status} />
                        </div>
                        {index < selectedCard.history.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-300 my-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                              {config.label}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(entry.created_at)}
                            </span>
                          </div>
                          {entry.changed_by && (
                            <p className="text-sm text-gray-600 mb-1">
                              <UserIcon className="inline h-4 w-4 mr-1" />
                              Changed by: User #{entry.changed_by}
                            </p>
                          )}
                          {entry.notes && (
                            <p className="text-sm text-gray-700 mt-2">
                              <DocumentTextIcon className="inline h-4 w-4 mr-1" />
                              {entry.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-500 py-8">No history available</p>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedCard(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
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
