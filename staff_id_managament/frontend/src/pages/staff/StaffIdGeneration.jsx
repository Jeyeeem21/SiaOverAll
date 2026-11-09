import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '../../api/client'
import Toast from '../../components/Toast'
import { CardGridSkeleton } from '../../components/LoadingSkeletons'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'

export default function StudentIdCards() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [previewCard, setPreviewCard] = useState(null)
  const [viewDetailsCard, setViewDetailsCard] = useState(null)
  const [selectedForBatch, setSelectedForBatch] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [releaseModal, setReleaseModal] = useState({ show: false, cardId: null, cardNumber: '' })
  const [cancelModal, setCancelModal] = useState({ show: false, cardId: null, cardNumber: '' })

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
    if (!canManageCards) return
    const card = cards.find(c => c.id === cardId)
    setCancelModal({ show: true, cardId: cardId, cardNumber: card?.card_number || '' })
  }

  async function confirmCancel(notes) {
    setError('')
    setNotice('')
    try {
      await apiRequest(`/student-id-cards/${cancelModal.cardId}`, { method: 'DELETE' })
      setNotice('ID card request cancelled successfully')
      setCancelModal({ show: false, cardId: null, cardNumber: '' })
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
    window.open(`${MAIN_SYSTEM_ORIGIN}/api/student-id-cards/batch-pdf?${queryString}`, '_blank')
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
            <div className="id-batch-toolbar mx-5 mt-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              <CardGridSkeleton count={6} />
            ) : (
              <div className="space-y-4">
                {/* ID Cards in Production */}
                {cards.length > 0 ? (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Cards in Production ({cards.length})</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
                          onViewDetails={setViewDetailsCard}
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

      {/* Cancel Card Modal */}
      {cancelModal.show && (
        <CancelCardModal
          cardNumber={cancelModal.cardNumber}
          onConfirm={confirmCancel}
          onCancel={() => setCancelModal({ show: false, cardId: null, cardNumber: '' })}
        />
      )}

      {/* View Details Modal */}
      {viewDetailsCard && (
        <ViewDetailsModal
          card={viewDetailsCard}
          onClose={() => setViewDetailsCard(null)}
          onApprove={canManageCards ? () => {
            updateCardStatus(viewDetailsCard.id, 'approved')
            setViewDetailsCard(null)
          } : null}
          onCancel={canManageCards ? () => {
            cancelCard(viewDetailsCard.id)
            setViewDetailsCard(null)
          } : null}
        />
      )}
    </div>
  )
}

function IDCardItem({ card, canManageCards, statusColors, onUpdateStatus, onRelease, onCancel, onPreview, onViewDetails, onToggleBatch, isSelected }) {
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
      </div>

      <div className="flex flex-wrap gap-2">
        {/* View Details Button - Always show for verification */}
        <button onClick={() => onViewDetails(card)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View Details
        </button>
        
        {card.status === 'requested' && (
          <>
            <button onClick={() => onUpdateStatus(card.id, 'approved')} disabled={!canManageCards} className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Approve
            </button>
            <button onClick={() => onCancel(card.id)} disabled={!canManageCards} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-all disabled:opacity-50">
              Cancel
            </button>
          </>
        )}
        {card.status === 'approved' && (
          <>
            <button onClick={() => onUpdateStatus(card.id, 'printed')} disabled={!canManageCards} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-all disabled:opacity-50">
              Mark Printed
            </button>
            <button onClick={() => onPreview(card)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">
              Preview
            </button>
          </>
        )}
        {card.status === 'printed' && (
          <>
            <button onClick={() => onRelease(card.id)} disabled={!canManageCards} className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-all disabled:opacity-50">
              Release
            </button>
            <button onClick={() => onPreview(card)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">
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

function ViewDetailsModal({ card, onClose, onApprove, onCancel }) {
  const student = card.student
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    birthdate: student?.birthdate || '',
    address: student?.address || '',
    contact_number: student?.contact_number || '',
    emergency_contact_name: student?.emergency_contact_name || '',
    emergency_contact_number: student?.emergency_contact_number || '',
    year_level: student?.year_level || '',
    section: student?.section || '',
    college: student?.college || '',
    department: student?.department || student?.program || '',
  })
  
  const [photoFile, setPhotoFile] = useState(null)
  const [signatureFile, setSignatureFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(student?.photo_url || null)
  const [signaturePreview, setSignaturePreview] = useState(student?.signature_url || null)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSignatureChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSignatureFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setSignaturePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setNotice('')
    
    try {
      // Update student info
      await apiRequest(`/students/${student.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      })

      // Upload photo if changed
      if (photoFile) {
        console.log('Uploading photo...')
        const photoData = new FormData()
        photoData.append('photo', photoFile)
        const photoResponse = await apiRequest(`/students/${student.id}/photo`, {
          method: 'POST',
          body: photoData,
        })
        console.log('Photo upload response:', photoResponse)
        
        // Update preview with new URL
        if (photoResponse?.data?.photo_url) {
          setPhotoPreview(photoResponse.data.photo_url)
        }
      }

      // Upload signature if changed
      if (signatureFile) {
        console.log('Uploading signature...')
        const signatureData = new FormData()
        signatureData.append('signature', signatureFile)
        const signatureResponse = await apiRequest(`/students/${student.id}/signature`, {
          method: 'POST',
          body: signatureData,
        })
        console.log('Signature upload response:', signatureResponse)
        
        // Update preview with new URL
        if (signatureResponse?.data?.signature_url) {
          setSignaturePreview(signatureResponse.data.signature_url)
        }
      }

      setNotice('Student information updated successfully!')
      setIsEditing(false)
      
      // Refresh the card data after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Save error:', error)
      setError('Error saving: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const isDataComplete = () => {
    return (
      (photoPreview || student?.photo_url) &&
      (signaturePreview || student?.signature_url) &&
      formData.birthdate &&
      formData.address &&
      formData.contact_number &&
      formData.emergency_contact_name &&
      formData.emergency_contact_number &&
      formData.year_level &&
      formData.section &&
      (formData.college || formData.department)
    )
  }
  
  return (
    <div className="app-modal-overlay fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-gray-900">Student ID Card Details</h2>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {isEditing ? 'Edit student information' : 'Verify student information before approval'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && card.status === 'requested' && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Info
                </button>
              )}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-5 bg-gray-50">
          <div className="space-y-4">
            {/* Photos Section */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="text-[13px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Photos {!photoPreview && !signaturePreview && <span className="text-sm text-red-600 font-normal">(Required)</span>}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                    Photo {!photoPreview && <span className="text-red-500">*</span>}
                  </label>
                  {isEditing ? (
                    <div>
                      {photoPreview ? (
                        <div className="relative">
                          <img src={photoPreview} alt="Student Photo" className="w-full h-48 object-cover rounded-xl border-2 border-gray-200" />
                          <button
                            type="button"
                            onClick={() => document.getElementById('photo-upload').click()}
                            className="absolute bottom-2 right-2 px-3 py-1 text-[11px] bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => document.getElementById('photo-upload').click()}
                          className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all"
                        >
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="mt-2 text-[11px] text-gray-600">Upload Photo</span>
                        </button>
                      )}
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </div>
                  ) : photoPreview ? (
                    <img src={photoPreview} alt="Student Photo" className="w-full h-48 object-cover rounded-xl border-2 border-gray-200" />
                  ) : (
                    <div className="w-full h-48 bg-red-50 border-2 border-red-300 rounded-xl flex items-center justify-center text-red-400">
                      <div className="text-center">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p className="text-sm mt-2">No photo</p>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                    Signature {!signaturePreview && <span className="text-red-500">*</span>}
                  </label>
                  {isEditing ? (
                    <div>
                      {signaturePreview ? (
                        <div className="relative">
                          <img src={signaturePreview} alt="Student Signature" className="w-full h-48 object-contain bg-white rounded-xl border-2 border-gray-200 p-4" />
                          <button
                            type="button"
                            onClick={() => document.getElementById('signature-upload').click()}
                            className="absolute bottom-2 right-2 px-3 py-1 text-[11px] bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => document.getElementById('signature-upload').click()}
                          className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all"
                        >
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <span className="mt-2 text-[11px] text-gray-600">Upload Signature</span>
                        </button>
                      )}
                      <input
                        id="signature-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleSignatureChange}
                        className="hidden"
                      />
                    </div>
                  ) : signaturePreview ? (
                    <img src={signaturePreview} alt="Student Signature" className="w-full h-48 object-contain bg-white rounded-xl border-2 border-gray-200 p-4" />
                  ) : (
                    <div className="w-full h-48 bg-red-50 border-2 border-red-300 rounded-xl flex items-center justify-center text-red-400">
                      <div className="text-center">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <p className="text-sm mt-2">No signature</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="text-[13px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoField 
                  label="Student ID" 
                  value={student?.student_number || student?.student_id_number} 
                  isEditing={false}
                />
                <InfoField 
                  label="Card Number" 
                  value={card.card_number} 
                  isEditing={false}
                />
                <InfoField 
                  label="First Name" 
                  value={student?.first_name} 
                  isEditing={false}
                />
                <InfoField 
                  label="Middle Name" 
                  value={student?.middle_name || '—'} 
                  isEditing={false}
                />
                <InfoField 
                  label="Last Name" 
                  value={student?.last_name} 
                  isEditing={false}
                />
                <InfoField 
                  label="Birthdate" 
                  value={formData.birthdate ? new Date(formData.birthdate).toLocaleDateString() : ''}
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  type="date"
                  name="birthdate"
                  required={true}
                />
                <InfoField 
                  label="Email" 
                  value={student?.email} 
                  isEditing={false}
                />
                <InfoField 
                  label="Contact Number" 
                  value={formData.contact_number}
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  name="contact_number"
                  required={true}
                />
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="text-[13px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Academic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoField 
                  label="Program/Department" 
                  value={formData.department || formData.college}
                  isEditing={isEditing}
                  onChange={(name, value) => {
                    handleInputChange('department', value)
                    handleInputChange('college', value)
                  }}
                  name="department"
                  required={true}
                />
                <InfoField 
                  label="College" 
                  value={formData.college}
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  name="college"
                />
                <InfoField 
                  label="Year Level" 
                  value={formData.year_level}
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  name="year_level"
                  required={true}
                />
                <InfoField 
                  label="Section" 
                  value={formData.section}
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  name="section"
                  required={true}
                />
              </div>
            </div>

            {/* Address & Emergency Contact */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="text-[13px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Address & Emergency Contact
              </h3>
              <div className="space-y-4">
                <InfoField 
                  label="Address" 
                  value={formData.address}
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  type="textarea"
                  name="address"
                  fullWidth
                  required={true}
                />
                <div className="grid grid-cols-2 gap-4">
                  <InfoField 
                    label="Emergency Contact Name" 
                    value={formData.emergency_contact_name}
                    isEditing={isEditing}
                    onChange={handleInputChange}
                    name="emergency_contact_name"
                    required={true}
                  />
                  <InfoField 
                    label="Emergency Contact Number" 
                    value={formData.emergency_contact_number}
                    isEditing={isEditing}
                    onChange={handleInputChange}
                    name="emergency_contact_number"
                    required={true}
                  />
                </div>
              </div>
            </div>

            {/* Request Information */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="text-[13px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Request Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Status" value={<span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">{card.status.toUpperCase()}</span>} />
                <InfoField label="Requested At" value={card.requested_at ? new Date(card.requested_at).toLocaleString() : '—'} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 bg-white border-t border-gray-200">
          {!isDataComplete() && !isEditing && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-900">Incomplete Information</p>
                <p className="text-sm text-amber-800 mt-1">Some required fields are missing. Please click "Edit Info" to complete the student information before approving.</p>
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all text-base disabled:opacity-50"
                >
                  Cancel Edit
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !isDataComplete()}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base"
                >
                  {saving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all text-base"
                >
                  Close
                </button>
                {card.status === 'requested' && onApprove && onCancel && (
                  <>
                    <button
                      onClick={onCancel}
                      className="px-6 py-4 border-2 border-red-300 bg-red-50 text-red-700 rounded-2xl font-bold hover:bg-red-100 hover:border-red-400 transition-all text-base"
                    >
                      Cancel Request
                    </button>
                    <button
                      onClick={onApprove}
                      disabled={!isDataComplete()}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      title={!isDataComplete() ? 'Please complete all required fields before approving' : ''}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Approve Request</span>
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoField({ label, value, fullWidth = false, required = false, isEditing = false, onChange, type = 'text', name }) {
  if (isEditing) {
    return (
      <div className={fullWidth ? 'col-span-2' : ''}>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {type === 'textarea' ? (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(name, e.target.value)}
            rows={3}
            className="w-full text-sm font-medium text-gray-900 bg-white px-4 py-3 rounded-xl border-2 border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all resize-none"
          />
        ) : type === 'date' ? (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(name, e.target.value)}
            className="w-full text-sm font-medium text-gray-900 bg-white px-4 py-3 rounded-xl border-2 border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
          />
        ) : (
          <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(name, e.target.value)}
            className="w-full text-sm font-medium text-gray-900 bg-white px-4 py-3 rounded-xl border-2 border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
          />
        )}
      </div>
    )
  }

  return (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label} {required && !value && <span className="text-red-500">*</span>}
      </label>
      <div className={`text-sm font-semibold rounded-xl border px-4 py-3 ${!value ? 'bg-red-50 text-red-600 border-red-300' : 'text-gray-900 bg-gray-50 border-gray-200'}`}>
        {value || '— Missing'}
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
              className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="app-modal-body p-8">
          <div className="space-y-4">
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
                <span>Releasing...</span>
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

function CancelCardModal({ cardNumber, onConfirm, onCancel }) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await onConfirm(reason)
    setLoading(false)
  }

  return (
    <div className="app-modal-overlay fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center animate-fade-in" onClick={onCancel}>
      <div 
        className="app-modal-panel bg-white max-w-lg animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-red-500 to-red-600">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center ring-4 ring-white/30">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">Cancel ID Card Request</h2>
              <p className="text-red-50 text-sm mt-1 font-medium">Card: {cardNumber}</p>
            </div>
            <button
              onClick={onCancel}
              className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="app-modal-body p-8">
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-900">Warning</p>
                <p className="text-sm text-amber-800 mt-1">This action cannot be undone. The student will need to submit a new request if needed.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">
                Reason for Cancellation <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for cancelling this request (e.g., incomplete information, duplicate request, etc.)"
                rows={4}
                autoFocus
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all resize-none text-base"
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
              Go Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-bold hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base"
            >
              {loading ? (
                <span>Cancelling...</span>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Confirm Cancellation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
