import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';

const ID_MANAGEMENT_API = import.meta.env.VITE_ID_MANAGEMENT_API_URL || 'http://localhost:8001/api';

export default function IdRequest() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [idStatus, setIdStatus] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requirements, setRequirements] = useState(null);
  
  // Get student_id from account_students table
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    loadStudentIdStatus();
  }, [user]);

  async function loadStudentIdStatus() {
    if (!user) return;
    
    try {
      setLoading(true);
      setError('');

      // Get student_number from user
      const studentNumber = user.student_number || user.reference_no;
      
      if (!studentNumber) {
        setError('Student number not found. Please update your profile.');
        setLoading(false);
        return;
      }

      // Search for student using PUBLIC endpoint
      const searchResponse = await fetch(`${ID_MANAGEMENT_API}/public/students/search?student_number=${studentNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!searchResponse.ok) {
        if (searchResponse.status === 404) {
          setError('Your student record not found in ID management system. Please contact the registrar.');
        } else {
          throw new Error('Failed to fetch student data');
        }
        setLoading(false);
        return;
      }

      const searchData = await searchResponse.json();
      const matchedStudent = searchData.student;
      
      if (!matchedStudent) {
        setError('Your student record not found in ID management system. Please contact the registrar.');
        setLoading(false);
        return;
      }

      setStudentId(studentNumber); // Store student_number for later use

      const requirementsResponse = await fetch(`${ID_MANAGEMENT_API}/public/students/${studentNumber}/id-card-requirements`);
      if (requirementsResponse.ok) {
        setRequirements(await requirementsResponse.json());
      }

      // Now fetch ID card status using PUBLIC endpoint
      const statusResponse = await fetch(`${ID_MANAGEMENT_API}/public/students/${studentNumber}/id-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setIdStatus(statusData);
      } else {
        // No active request found
        setIdStatus(null);
      }
    } catch (err) {
      console.error('Error loading ID status:', err);
      setError(err.message || 'Failed to load ID card status');
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestId() {
    if (!studentId) {
      setError('Student ID not found. Please refresh the page.');
      return;
    }

    if (!requirements?.complete) {
      setError('Complete all ID card requirements before submitting your request.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const response = await fetch(`${ID_MANAGEMENT_API}/public/students/${studentId}/id-card-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit ID request');
      }

      setSuccess(data.message || 'ID card request submitted successfully! Staff will process your request soon.');
      setShowRequestForm(false);
      
      // Reload status
      await loadStudentIdStatus();
    } catch (err) {
      console.error('Error requesting ID:', err);
      setError(err.message || 'Failed to submit ID request');
    } finally {
      setSubmitting(false);
    }
  }

  const getStatusConfig = (status) => {
    const configs = {
      requested: { 
        label: 'Pending Review', 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: '📋',
        description: 'Your ID request is waiting for staff approval'
      },
      approved: { 
        label: 'Approved - In Production', 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: '✅',
        description: 'Your ID has been approved and is being printed'
      },
      printed: { 
        label: 'Printed - Ready for Pickup', 
        color: 'bg-purple-100 text-purple-800 border-purple-200', 
        icon: '🖨️',
        description: 'Your ID card is ready! Please visit the office to claim it'
      },
      released: { 
        label: 'Released', 
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
        icon: '✓',
        description: 'Your ID card has been released'
      },
      invalid: { 
        label: 'Invalid (Replaced)', 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: '⊘',
        description: 'This ID card has been replaced by a new one'
      },
    };
    return configs[status] || configs.requested;
  };

  if (loading) {
    return (
      <>
        <Navigation userRole="student" />
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation userRole="student" />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student ID Card</h1>
          <p className="text-gray-600 mt-2">Request and track your student ID card</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
            <button onClick={() => setSuccess('')} className="text-green-400 hover:text-green-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Current ID Status */}
        {idStatus && idStatus.current_card ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Current ID Request</h2>
                <p className="text-sm text-gray-500 mt-1">Card Number: {idStatus.current_card.card_number}</p>
              </div>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusConfig(idStatus.current_card.status).color}`}>
                <span className="text-lg">{getStatusConfig(idStatus.current_card.status).icon}</span>
                {getStatusConfig(idStatus.current_card.status).label}
              </span>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-900">
                {getStatusConfig(idStatus.current_card.status).description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Requested On:</span>
                <p className="font-medium text-gray-900">
                  {new Date(idStatus.current_card.requested_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              {idStatus.current_card.status === 'released' && idStatus.current_card.released_at && (
                <div>
                  <span className="text-gray-500">Released On:</span>
                  <p className="font-medium text-gray-900">
                    {new Date(idStatus.current_card.released_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
              {idStatus.current_card.notes && (
                <div className="sm:col-span-2">
                  <span className="text-gray-500">Notes:</span>
                  <p className="font-medium text-gray-900">{idStatus.current_card.notes}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Active ID Request</h3>
            <p className="text-gray-600 mb-6">You don't have an active ID card request. Click the button below to request one.</p>
            <button
              onClick={() => setShowRequestForm(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Request New ID Card
            </button>
          </div>
        )}

        {/* Release History */}
        {idStatus && idStatus.history && idStatus.history.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Release History</h2>
            <div className="space-y-4">
              {idStatus.history.map((card) => (
                <div key={card.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{card.card_number}</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusConfig(card.status).color}`}>
                      <span>{getStatusConfig(card.status).icon}</span>
                      {getStatusConfig(card.status).label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="text-gray-500">Requested:</span>
                      <span className="ml-2 font-medium">
                        {new Date(card.requested_at).toLocaleDateString()}
                      </span>
                    </div>
                    {card.released_at && (
                      <div>
                        <span className="text-gray-500">Released:</span>
                        <span className="ml-2 font-medium">
                          {new Date(card.released_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Request Form Modal */}
        {showRequestForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowRequestForm(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Request New ID Card</h3>
                <p className="text-sm text-gray-600 mt-1">Confirm your ID card request</p>
              </div>
              
              <div className="px-6 py-5">
                <div className={`border rounded-xl p-4 mb-5 ${requirements?.complete ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                  <p className="text-sm font-medium mb-2 text-gray-900">ID card requirements</p>
                  <ul className="space-y-2">
                    {(requirements?.items || []).map((item) => (
                      <li key={item.key} className="text-sm flex gap-2">
                        <span className={item.complete ? 'text-green-600' : 'text-amber-600'}>{item.complete ? '✓' : '•'}</span>
                        <span className={item.complete ? 'text-green-800' : 'text-amber-900'}>{item.label}{!item.complete && ` — ${item.action}`}</span>
                      </li>
                    ))}
                  </ul>
                  {!requirements?.complete && <Link to="/profile" className="inline-block mt-3 text-sm font-semibold text-blue-700 hover:text-blue-800">Update profile or upload documents →</Link>}
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                  <h4 className="font-semibold text-gray-900 mb-2">Your Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-900">{user?.name}</span></p>
                    <p><span className="text-gray-500">Student Number:</span> <span className="font-medium text-gray-900">{user?.student_number || user?.reference_no}</span></p>
                    <p><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-900">{user?.email}</span></p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRequestForm(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestId}
                    disabled={submitting || !requirements?.complete}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : requirements?.complete ? 'Submit Request' : 'Requirements Incomplete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
