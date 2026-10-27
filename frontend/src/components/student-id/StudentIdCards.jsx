import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '../../api/client'
import Toast from '../Toast'

const API_BASE_URL = 'http://localhost:8000'

export default function StudentIdCards() {
  const [students, setStudents] = useState([])
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [previewCard, setPreviewCard] = useState(null)
  const [selectedForBatch, setSelectedForBatch] = useState([])
  const [photoUpload, setPhotoUpload] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [activeTab, setActiveTab] = useState('ready') // 'ready' or 'requests'

  const canManageCards = ['Admin', 'Staff'].includes(currentUser?.role)

  useEffect(() => {
    let active = true
    apiRequest('/user')
      .then((user) => { 
        if (active) setCurrentUser(user) 
      })
      .catch(() => { 
        if (active) setCurrentUser(null) 
      })
    return () => { active = false }
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [studentsRes, cardsRes] = await Promise.all([
        apiRequest('/students'),
        apiRequest('/student-id-cards')
      ])
      setStudents(studentsRes.data ?? [])
      setCards(cardsRes.data ?? [])
    } catch (err) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  async function requestIdCard(studentId) {
    if (!canManageCards) {
      setError('You do not have permission to request ID cards')
      return
    }
    setError('')
    setNotice('')
    try {
      await apiRequest(`/students/${studentId}/id-card-request`, { method: 'POST' })
      setNotice('ID card request created successfully')
      await loadData()
      setActiveTab('requests') // Switch to requests tab
    } catch (err) {
      setError(err.message || 'Failed to request ID card')
    }
  }

  async function updateCardStatus(cardId, status, notes = '') {
    if (!canManageCards) return
    setError('')
    setNotice('')
    try {
      await apiRequest(`/student-id-cards/${cardId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes })
      })
      setNotice(`ID card ${status} successfully`)
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  async function releaseCard(cardId) {
    if (!canManageCards) return
    const recipientName = window.prompt('Enter recipient name (student name):')
    if (!recipientName) return
    
    const notes = window.prompt('Add any notes (optional):')
    
    setError('')
    setNotice('')
    try {
      await apiRequest(`/student-id-cards/${cardId}/release`, {
        method: 'POST',
        body: JSON.stringify({ recipient_name: recipientName, notes: notes || '' })
      })
      setNotice('ID card released successfully')
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  async function cancelCard(cardId) {
    if (!canManageCards || !window.confirm('Cancel this ID card request?')) return
    setError('')
    setNotice('')
    try {
      await apiRequest(`/student-id-cards/${cardId}`, { method: 'DELETE' })
      setNotice('ID card request cancelled')
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  async function uploadPhoto(studentId, file) {
    if (!canManageCards) return
    setError('')
    setNotice('')
    const formData = new FormData()
    formData.append('photo', file)
    
    const student = students.find(s => s.id === studentId)
    if (student) {
      Object.entries(student).forEach(([key, value]) => {
        if (value && key !== 'id' && key !== 'photo_url' && key !== 'full_name' && key !== 'created_at' && key !== 'updated_at' && key !== 'deleted_at' && key !== 'user_id') {
          formData.append(key, value)
        }
      })
    }

    try {
      await apiRequest(`/students/${studentId}`, {
        method: 'POST',
        body: formData,
        headers: {
          'X-HTTP-Method-Override': 'PATCH'
        }
      })
      setNotice('Photo uploaded successfully')
      setPhotoUpload(null)
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  function toggleBatchSelect(cardId) {
    setSelectedForBatch(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    )
  }

  function generateBatchPdf() {
    if (selectedForBatch.length === 0) {
      setError('Please select at least one ID card for batch printing')
      return
    }
    const queryString = selectedForBatch.map(id => `card_ids[]=${id}`).join('&')
    window.open(`${API_BASE_URL}/api/student-id-cards/batch-pdf?${queryString}`, '_blank')
  }

  const studentsWithoutCards = students.filter(student => 
    !cards.some(card => card.student_id === student.id && ['requested', 'approved', 'printed'].includes(card.status))
  )

  const statusColors = {
    requested: 'bg-amber-100 text-amber-800 border-amber-200',
    approved: 'bg-blue-100 text-blue-800 border-blue-200',
    printed: 'bg-violet-100 text-violet-800 border-violet-200',
    released: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-50">
      {/* Top Navigation Bar - Matching StudentRecords */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              </div>
              <span className="text-xl font-semibold text-gray-800">Student Portal</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900">{currentUser?.full_name || 'Admin User'}</div>
                <div className="text-xs text-gray-500">{currentUser?.role || 'Administrator'}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold">
                {currentUser?.full_name?.[0] || 'A'}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 -mb-px overflow-x-auto">
            <button onClick={() => window.location.href = '/'} className="px-6 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 transition-colors whitespace-nowrap">
              Students
            </button>
            <button className="px-6 py-3 text-sm font-medium text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50 whitespace-nowrap">
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
            <button onClick={() => window.location.href = '/id-management'} className="px-6 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 transition-colors whitespace-nowrap">
              ID Management
            </button>
            <button onClick={() => window.location.href = '/staff'} className="px-6 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 transition-colors whitespace-nowrap">
              Staff
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Content Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">ID Card Management</h1>
            <p className="text-sm text-gray-500 mt-1">Request, approve, print, and release student ID cards</p>
          </div>

          {/* Alerts */}
          <Toast type="error" message={error} onClose={() => setError('')} />
          <Toast type="success" message={notice} onClose={() => setNotice('')} />

          {/* Batch Actions */}
          {selectedForBatch.length > 0 && (
            <div className="mx-8 mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold">
                  {selectedForBatch.length}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Cards selected for batch printing</p>
                  <p className="text-xs text-gray-500 mt-0.5">Ready to generate PDF with all selected cards</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelectedForBatch([])} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
                  Clear
                </button>
                <button onClick={generateBatchPdf} className="px-5 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-all shadow-sm flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                  Generate PDF
                </button>
              </div>
            </div>
          )}

          {/* Sub-Tabs */}
          <div className="px-8 mt-6 flex space-x-1 border-b border-gray-100">
            <button 
              onClick={() => setActiveTab('ready')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'ready' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Ready for Cards ({studentsWithoutCards.length})
            </button>
            <button 
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'requests' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Card Requests ({cards.length})
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-sm text-gray-500">Loading...</p>
              </div>
            ) : activeTab === 'ready' ? (
              studentsWithoutCards.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">All students have ID cards</h3>
                  <p className="mt-1 text-sm text-gray-500">Every student either has an active card request or a released card</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studentsWithoutCards.map(student => (
                    <StudentReadyCard 
                      key={student.id} 
                      student={student} 
                      onRequest={requestIdCard}
                      onUploadPhoto={() => setPhotoUpload(student.id)}
                      canManage={canManageCards}
                    />
                  ))}
                </div>
              )
            ) : (
              cards.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">No ID card requests yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Start by requesting ID cards for students with photos</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {cards.map(card => (
                    <IDCardItem
                      key={card.id}
                      card={card}
                      canManageCards={canManageCards}
                      statusColors={statusColors}
                      onUpdateStatus={updateCardStatus}
                      onRelease={releaseCard}
                      onCancel={cancelCard}
                      onPreview={setPreviewCard}
                      onToggleBatch={toggleBatchSelect}
                      isSelected={selectedForBatch.includes(card.id)}
                    />
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </main>

      {/* Photo Upload Modal */}
      {photoUpload && (
        <Modal onClose={() => setPhotoUpload(null)} title="Upload Student Photo">
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">Please upload a photo before requesting an ID card</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  uploadPhoto(photoUpload, file)
                }
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:text-white file:font-medium hover:file:bg-emerald-600"
            />
          </div>
        </Modal>
      )}

      {/* ID Card Preview Modal - Front and Back Side-by-Side */}
      {previewCard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewCard(null)}>
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-blue-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">ID Card Preview</h2>
                <p className="text-sm text-gray-600 mt-1">{previewCard.student?.full_name}</p>
              </div>
              <button
                onClick={() => setPreviewCard(null)}
                className="w-10 h-10 rounded-lg hover:bg-white/50 flex items-center justify-center transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* ID Card Preview */}
            <div className="p-8 bg-gray-50">
              <div className="max-w-md mx-auto">
                
                {/* FRONT CARD ONLY */}
                <div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h3 className="text-base font-bold text-gray-800 uppercase">Student ID Card</h3>
                  </div>
                  <div className="bg-white rounded-xl shadow-2xl border-4 border-green-100 overflow-hidden">
                    <iframe
                      src={`${API_BASE_URL}/student-id-cards/${previewCard.id}/preview`}
                      className="w-full h-[600px] border-0"
                      title="ID Card Preview"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-8 py-4 border-t border-gray-200 bg-white flex gap-3 justify-center">
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              <button
                onClick={() => setPreviewCard(null)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StudentReadyCard({ student, onRequest, onUploadPhoto, canManage }) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all">
      <div className="flex items-start gap-4 mb-4">
        {student.photo_url ? (
          <img src={student.photo_url} alt={student.full_name} className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm flex-shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {student.first_name?.[0]}{student.last_name?.[0]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{student.full_name}</h3>
          <p className="text-xs text-gray-500 mt-1 truncate">{student.student_id_number}</p>
          <p className="text-xs text-gray-600 mt-0.5 truncate">{student.program} • {student.year_level}</p>
        </div>
      </div>
      {student.photo_path ? (
        <button
          disabled={!canManage}
          onClick={() => onRequest(student.id)}
          className="w-full px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Request ID Card
        </button>
      ) : (
        <button
          disabled={!canManage}
          onClick={onUploadPhoto}
          className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          Upload Photo First
        </button>
      )}
    </div>
  )
}

function IDCardItem({ card, canManageCards, statusColors, onUpdateStatus, onRelease, onCancel, onPreview, onToggleBatch, isSelected }) {
  const student = card.student

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:shadow-lg transition-all">
      <div className="flex items-start gap-4 mb-4">
        {['approved', 'printed', 'released'].includes(card.status) && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleBatch(card.id)}
            className="mt-1 w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
          />
        )}
        {student?.photo_url ? (
          <img src={student.photo_url} alt={student.full_name} className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-md flex-shrink-0" />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
            {student?.first_name?.[0]}{student?.last_name?.[0]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-lg truncate">{student?.full_name || 'Unknown Student'}</h3>
          <p className="text-sm text-gray-500 mt-1 font-mono">{card.card_number}</p>
          <p className="text-xs text-gray-600 mt-0.5 truncate">{student?.student_id_number}</p>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[card.status]}`}>
            {card.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-xs bg-gray-50 p-3 rounded-xl">
        <div><span className="text-gray-500">Program:</span> <span className="font-medium text-gray-900">{student?.program}</span></div>
        <div><span className="text-gray-500">Year:</span> <span className="font-medium text-gray-900">{student?.year_level}</span></div>
        <div className="col-span-2"><span className="text-gray-500">Department:</span> <span className="font-medium text-gray-900">{student?.department}</span></div>
      </div>

      <div className="flex flex-wrap gap-2">
        {card.status === 'requested' && (
          <>
            <button onClick={() => onUpdateStatus(card.id, 'approved')} disabled={!canManageCards} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-all disabled:opacity-50">
              ✓ Approve
            </button>
            <button onClick={() => onCancel(card.id)} disabled={!canManageCards} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-all disabled:opacity-50">
              ✕ Cancel
            </button>
          </>
        )}
        {card.status === 'approved' && (
          <button onClick={() => onUpdateStatus(card.id, 'printed')} disabled={!canManageCards} className="flex-1 px-4 py-2 bg-violet-500 text-white rounded-xl text-sm font-medium hover:bg-violet-600 transition-all disabled:opacity-50">
              🖨️ Mark Printed
            </button>
        )}
        {card.status === 'printed' && (
          <button onClick={() => onRelease(card.id)} disabled={!canManageCards} className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-all disabled:opacity-50">
            📋 Release
          </button>
        )}
        {['approved', 'printed', 'released'].includes(card.status) && (
          <>
            <button onClick={() => onPreview(card)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">
              👁️ Preview
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function Modal({ onClose, title, children, large = false }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className={`bg-white rounded-3xl shadow-2xl ${large ? 'max-w-4xl' : 'max-w-md'} w-full max-h-[90vh] overflow-hidden`} onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-4rem)]">
          {children}
        </div>
      </div>
    </div>
  )
}
