import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '../../api/client'
import Toast from '../../components/Toast'

const API_BASE_URL = 'http://localhost:8000'

export default function StudentIdCards() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [previewCard, setPreviewCard] = useState(null)
  const [selectedForBatch, setSelectedForBatch] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [releaseModal, setReleaseModal] = useState({ show: false, cardId: null, cardNumber: '' })

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
      const cardsRes = await apiRequest('/student-id-cards')
      // Show every active request that still needs staff action in the production workflow.
      const productionCards = (cardsRes.data ?? []).filter(card => 
        ['requested', 'approved', 'printed'].includes(card.status)
      )
      setCards(productionCards)
    } catch (err) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

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
    const card = cards.find(c => c.id === cardId)
    setReleaseModal({ show: true, cardId: cardId, cardNumber: card?.card_number || '' })
  }

  async function confirmRelease(recipientName, notes) {
    setError('')
    setNotice('')
    try {
      await apiRequest(`/student-id-cards/${releaseModal.cardId}/release`, {
        method: 'POST',
        body: JSON.stringify({ recipient_name: recipientName, notes: notes || '' })
      })
      setNotice('ID card released successfully')
      setReleaseModal({ show: false, cardId: null, cardNumber: '' })
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  async function cancelCard(cardId) {
    if (!canManageCards || !window.confirm('Cancel this ID card?')) return
    setError('')
    setNotice('')
    try {
      await apiRequest(`/student-id-cards/${cardId}`, { method: 'DELETE' })
      setNotice('ID card cancelled')
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

  const statusColors = {
    requested: 'bg-amber-100 text-amber-800 border-amber-200',
    approved: 'bg-blue-100 text-blue-800 border-blue-200',
    printed: 'bg-violet-100 text-violet-800 border-violet-200',
    released: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  }

  return (
    <div className="workflow-page">
      <div className="workflow-surface bg-white">
          {/* Header */}
          <div className="workflow-header">
            <h1 className="text-2xl font-bold text-gray-900">ID Card Production</h1>
            <p className="text-sm text-gray-500 mt-1">Print and release approved ID cards</p>
          </div>

          {/* Alerts */}
          <Toast type="error" message={error} onClose={() => setError('')} />
          <Toast type="success" message={notice} onClose={() => setNotice('')} />

          {/* Batch Actions */}
          {selectedForBatch.length > 0 && (
            <div className="mx-6 mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 flex items-center justify-between">
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

          {/* Content */}
          <div className="workflow-content">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-sm text-gray-500">Loading...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* ID Cards in Production */}
                {cards.length > 0 ? (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Cards in Production ({cards.length})</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No cards in production</h3>
                    <p className="mt-1 text-sm text-gray-500">Approved cards will appear here for printing and release</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      {/* Preview Modal - Front and Back Side-by-Side */}
      {previewCard && (
        <div className="app-modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setPreviewCard(null)}>
          <div 
            className="app-modal-panel bg-white max-w-[1400px]"
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

            {/* ID Card Preview - Front & Back already side-by-side in the blade template */}
            <div className="app-modal-body p-4 bg-gray-50">
              <div className="bg-white rounded-xl shadow-xl overflow-hidden border-2 border-gray-200">
                <iframe
                  src={`${API_BASE_URL}/student-id-cards/${previewCard.id}/preview`}
                  className="w-full h-[650px] border-0"
                  title="ID Card Preview - Front & Back"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="app-modal-footer bg-gradient-to-b from-gray-50 to-white">
              <button
                onClick={() => window.print()}
                className="print-id-button w-full max-w-xs mx-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 flex items-center justify-center gap-3 text-lg group"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print ID Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Release Card Modal */}
      {releaseModal.show && (
        <ReleaseCardModal
          cardNumber={releaseModal.cardNumber}
          onConfirm={confirmRelease}
          onCancel={() => setReleaseModal({ show: false, cardId: null, cardNumber: '' })}
        />
      )}
    </div>
  )
}

function IDCardItem({ card, canManageCards, statusColors, onUpdateStatus, onRelease, onCancel, onPreview, onToggleBatch, isSelected }) {
  const student = card.student

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:shadow-lg transition-all">
      <div className="flex items-start gap-4 mb-4">
        {['approved', 'printed'].includes(card.status) && (
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
          <p className="text-xs text-gray-500 mt-0.5">Requested: {card.requested_at ? new Date(card.requested_at).toLocaleDateString() : '—'}</p>
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
              Approve
            </button>
            <button onClick={() => onCancel(card.id)} disabled={!canManageCards} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-all disabled:opacity-50">
              Cancel
            </button>
          </>
        )}
        {card.status === 'approved' && (
          <button onClick={() => onUpdateStatus(card.id, 'printed')} disabled={!canManageCards} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-all disabled:opacity-50">
            Mark Printed
          </button>
        )}
        {card.status === 'printed' && (
          <button onClick={() => onRelease(card.id)} disabled={!canManageCards} className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-all disabled:opacity-50">
            Release
          </button>
        )}
        {['approved', 'printed'].includes(card.status) && (
          <>
            <button onClick={() => onPreview(card)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">
              Preview
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function Modal({ onClose, title, children, large = false }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50" onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-xl ${large ? 'max-w-4xl' : 'max-w-md'} w-full max-h-[92vh] overflow-hidden mx-8`} onClick={e => e.stopPropagation()}>
        <div className="px-8 py-6 mx-8 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
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

function ReleaseCardModal({ cardNumber, onConfirm, onCancel }) {
  const [recipientName, setRecipientName] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!recipientName.trim()) return
    
    setLoading(true)
    await onConfirm(recipientName, notes)
    setLoading(false)
  }

  return (
    <div className="app-modal-overlay fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center animate-fade-in" onClick={onCancel}>
      <div 
        className="app-modal-panel bg-white max-w-lg animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-emerald-500 to-teal-500">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center ring-4 ring-white/30">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">Release ID Card</h2>
              <p className="text-emerald-50 text-sm mt-1 font-medium">Card: {cardNumber}</p>
            </div>
            <button
              onClick={onCancel}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="app-modal-body p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">
                Recipient Name (Student Name) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Enter full name of student"
                required
                autoFocus
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all text-base font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">
                Notes <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes or remarks..."
                rows={4}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all resize-none text-base"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !recipientName.trim()}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Releasing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Confirm Release</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
