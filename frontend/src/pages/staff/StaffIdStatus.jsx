import { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
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
      const response = await apiRequest('/student-id-cards');
      setCards(response.data || []);
    } catch (error) {
      console.error('Error fetching ID cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this ID card?')) return;
    
    try {
      await apiRequest(`/student-id-cards/${cardId}`, { method: 'DELETE' });
      await fetchCards();
      alert('ID card deleted successfully');
    } catch (error) {
      console.error('Error deleting ID card:', error);
      alert(error.message || 'Failed to delete ID card');
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedCard || !statusUpdateData.status) return;

    try {
      setUpdating(true);
      await apiRequest(`/student-id-cards/${selectedCard.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(statusUpdateData)
      });
      await fetchCards();
      setShowStatusModal(false);
      setSelectedCard(null);
      setStatusUpdateData({ status: '', notes: '', expiry_date: '', replacement_reason: '' });
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.message || 'Failed to update status');
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
    <div className="workflow-page">
      <div className="workflow-surface bg-white">
        <div className="workflow-header">
          <h1 className="text-2xl font-bold text-gray-900">ID Request Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage student ID card requests and status updates</p>
        </div>

        <div className="workflow-toolbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(STATUS_CONFIG).filter(([status]) => status !== 'replacement_requested').map(([status, config]) => {
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

        <div className="workflow-content pt-0">
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Card Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCards.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No ID requests found</td>
                  </tr>
                ) : (
                  filteredCards.map((card) => {
                    const config = STATUS_CONFIG[card.status] || STATUS_CONFIG.requested;
                    
                    return (
                      <tr key={card.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{card.card_number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {card.student?.photo_url ? (
                              <img src={card.student.photo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                                {card.student?.first_name?.[0]}{card.student?.last_name?.[0]}
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{card.student?.full_name || `${card.student?.first_name || ''} ${card.student?.last_name || ''}`}</div>
                              <div className="text-sm text-gray-500">{card.student?.student_id_number}</div>
                              <div className="text-xs text-gray-500">{card.student?.program} · {card.student?.year_level} · {card.student?.department}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                            <StatusIcon status={card.status} />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(card.requested_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {card.expiry_date ? new Date(card.expiry_date).toLocaleDateString() : 'Not set'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedCard(card);
                                setShowHistoryModal(true);
                              }}
                              className="status-action text-blue-600 hover:text-blue-900"
                              title="View"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedCard(card);
                                setStatusUpdateData({ status: '', notes: '', expiry_date: '', replacement_reason: '' });
                                setShowStatusModal(true);
                              }}
                              className="status-action text-emerald-600 hover:text-emerald-900"
                              title="Edit Status"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteCard(card.id)}
                              className="status-action text-amber-600 hover:text-amber-900"
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
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

      {showStatusModal && selectedCard && (
        <div className="app-modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="app-modal-panel bg-white max-w-2xl">
            <div className="app-modal-header flex items-center justify-between bg-white">
              <h3 className="text-xl font-bold text-gray-900">Update Status</h3>
              <button onClick={() => { setShowStatusModal(false); setSelectedCard(null); setStatusUpdateData({ status: '', notes: '', expiry_date: '', replacement_reason: '' }); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="app-modal-body">
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Current Status: <span className="font-semibold">{STATUS_CONFIG[selectedCard.status].label}</span></p>
                <p className="text-sm text-gray-600">Student: <span className="font-semibold">{selectedCard.student?.first_name} {selectedCard.student?.last_name}</span></p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Status <span className="text-red-500">*</span></label>
                  <select value={statusUpdateData.status} onChange={(e) => setStatusUpdateData({ ...statusUpdateData, status: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                    <option value="">Select new status...</option>
                    {getValidTransitions(selectedCard.status).map((status) => (
                      <option key={status} value={status}>{STATUS_CONFIG[status].label}</option>
                    ))}
                  </select>
                </div>

                {(statusUpdateData.status === 'approved' || statusUpdateData.status === 'printed') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date (Optional)</label>
                    <input type="date" value={statusUpdateData.expiry_date} onChange={(e) => setStatusUpdateData({ ...statusUpdateData, expiry_date: e.target.value })} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>
                )}

                {statusUpdateData.status === 'replacement_requested' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Replacement Reason <span className="text-red-500">*</span></label>
                    <textarea value={statusUpdateData.replacement_reason} onChange={(e) => setStatusUpdateData({ ...statusUpdateData, replacement_reason: e.target.value })} placeholder="Enter reason for replacement..." rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea value={statusUpdateData.notes} onChange={(e) => setStatusUpdateData({ ...statusUpdateData, notes: e.target.value })} placeholder="Add any additional notes..." rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
              </div>
            </div>

            <div className="app-modal-footer flex gap-3">
              <button onClick={() => { setShowStatusModal(false); setSelectedCard(null); setStatusUpdateData({ status: '', notes: '', expiry_date: '', replacement_reason: '' }); }} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium">Cancel</button>
              <button onClick={handleStatusUpdate} disabled={updating || !statusUpdateData.status || (statusUpdateData.status === 'replacement_requested' && !statusUpdateData.replacement_reason)} className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">{updating ? 'Updating...' : 'Update Status'}</button>
            </div>
          </div>
        </div>
      )}

      {showHistoryModal && selectedCard && (
        <div className="app-modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="app-modal-panel bg-white max-w-3xl">
            <div className="app-modal-header flex items-center justify-between bg-white">
              <h3 className="text-xl font-bold text-gray-900">Status History</h3>
              <button onClick={() => { setShowHistoryModal(false); setSelectedCard(null); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="app-modal-body">
              <div className="mb-6 p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-600"><span className="font-medium">Card:</span> {selectedCard.card_number}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Student:</span> {selectedCard.student?.first_name} {selectedCard.student?.last_name}</p>
                {selectedCard.expiry_date && <p className="text-sm text-gray-600"><span className="font-medium">Expiry Date:</span> {new Date(selectedCard.expiry_date).toLocaleDateString()}</p>}
                {selectedCard.replacement_reason && <p className="text-sm text-gray-600"><span className="font-medium">Replacement Reason:</span> {selectedCard.replacement_reason}</p>}
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
                          {index < selectedCard.history.length - 1 && <div className="w-0.5 h-full bg-gray-300 my-2"></div>}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>
                              <span className="text-xs text-gray-500">{formatDate(entry.created_at)}</span>
                            </div>
                            {entry.changed_by && <p className="text-sm text-gray-600 mb-1"><UserIcon className="inline h-4 w-4 mr-1" />Changed by: User #{entry.changed_by}</p>}
                            {entry.notes && <p className="text-sm text-gray-700 mt-2"><DocumentTextIcon className="inline h-4 w-4 mr-1" />{entry.notes}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-500 py-8">No history available</p>
                )}
              </div>
            </div>

            <div className="app-modal-footer flex justify-end">
              <button onClick={() => { setShowHistoryModal(false); setSelectedCard(null); }} className="px-6 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
