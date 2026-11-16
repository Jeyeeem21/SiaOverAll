import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import './App.css'
import RequestList from './pages/RequestList.jsx'
import RequestDetail from './pages/RequestDetail.jsx'
import StickerCustomization from './pages/StickerCustomization.jsx'
import StickerPreview from './pages/StickerPreview.jsx'
import api from './services/api.js'

function App() {
  const [currentPage, setCurrentPage] = useState('list')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [generatedSticker, setGeneratedSticker] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState(null)

  // Fetch real data from API
  useEffect(() => {
    const mainSystemOrigin = import.meta.env.VITE_MAIN_SYSTEM_URL || 'https://minsu-businesscenter.up.railway.app'
    const embedded = window.self !== window.top

    const receiveAuthToken = (event) => {
      if (event.origin !== mainSystemOrigin || event.data?.type !== 'AUTH_TOKEN' || !event.data.token) {
        return
      }

      localStorage.setItem('token', event.data.token)
      fetchRequests()
    }

    window.addEventListener('message', receiveAuthToken)

    if (api.isAuthenticated()) {
      fetchRequests()
    } else if (embedded) {
      window.parent.postMessage({ type: 'REQUEST_AUTH_TOKEN' }, mainSystemOrigin)
    } else {
      fetchRequests()
    }

    return () => window.removeEventListener('message', receiveAuthToken)
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.getAllRequests()
      
      // Transform API data to match component format
      const transformedRequests = response.data.map(req => ({
        id: req.id,
        studentName: req.student_name,
        studentId: req.student_id,
        vehicleType: req.vehicle_type,
        plateNumber: req.plate_number,
        status: req.status,
        submittedDate: req.submitted_date,
        documents: ['Official Receipt', 'Certification of Registration', 'Driver\'s License'],
        vehicleModel: req.vehicle_model,
        vehicleColor: req.vehicle_color,
        remarks: req.remarks,
        reviewedBy: req.reviewed_by,
        reviewedAt: req.reviewed_at,
        hasSticker: req.has_sticker,
        stickerSerial: req.sticker_serial
      }))
      
      setRequests(transformedRequests)
    } catch (err) {
      console.error('Failed to fetch requests:', err)
      setError('Failed to load sticker requests. Please check if you are logged in.')
    } finally {
      setLoading(false)
    }
  }

  const handleViewRequest = (request) => {
    setSelectedRequest(request)
    setCurrentPage('detail')
  }

  const handleApprove = async (request) => {
    try {
      await api.approveRequest(request.id)

      const approvedRequest = { ...request, status: 'approved' }
      setRequests((current) => current.map((item) =>
        item.id === request.id ? approvedRequest : item
      ))
      setSelectedRequest(approvedRequest)
      setCurrentPage('customize')
    } catch (error) {
      setFeedback({ type: 'error', message: `Failed to approve request: ${error.message}` })
    }
  }

  const handleDecline = async (request, reason) => {
    try {
      await api.declineRequest(request.id, reason)
      
      // Update local state
      setRequests(requests.map(r => 
        r.id === request.id 
          ? { ...r, status: 'rejected', remarks: reason, declinedDate: new Date().toLocaleDateString() } 
          : r
      ))
      
      setFeedback({ type: 'success', message: `Request from ${request.studentName} has been declined.` })
      setCurrentPage('list')
      setSelectedRequest(null)
      
      // Refresh data
      fetchRequests()
    } catch (error) {
      setFeedback({ type: 'error', message: `Failed to decline request: ${error.message}` })
    }
  }

  const handleGenerateSticker = async (customizationData) => {
    try {
      const stickerData = {
        vehicle_code: `${customizationData.vehicleType.charAt(0).toUpperCase()}-${customizationData.vehicleCode}`,
        price: parseFloat(customizationData.price),
        valid_month: customizationData.month,
        valid_year: customizationData.year
      }
      
      const response = await api.generateSticker(selectedRequest.id, stickerData)
      
      const sticker = {
        ...selectedRequest,
        ...customizationData,
        requestId: selectedRequest.id,
        serialNumber: response.data.serial_number,
        generatedDate: new Date().toLocaleDateString(),
        generatedTime: new Date().toLocaleTimeString()
      }
      
      setGeneratedSticker(sticker)
      
      // Update request status
      setRequests(requests.map(r => 
        r.id === selectedRequest.id 
          ? { ...r, status: 'generated', hasSticker: true, stickerSerial: response.data.serial_number } 
          : r
      ))
      
      setCurrentPage('preview')
      
      // Refresh data
      fetchRequests()
    } catch (error) {
      setFeedback({ type: 'error', message: `Failed to generate sticker: ${error.message}` })
    }
  }

  const handleMarkPrinted = async (requestId) => {
    try {
      await api.markPrinted(requestId)
      setRequests((current) => current.map((request) =>
        request.id === requestId ? { ...request, status: 'completed' } : request
      ))
      setGeneratedSticker((current) => current ? { ...current, status: 'completed' } : current)
      setFeedback({ type: 'success', message: 'Sticker marked as printed.' })
    } catch (error) {
      setFeedback({ type: 'error', message: `Failed to mark sticker as printed: ${error.message}` })
    }
  }

  const handleOpenGeneratedSticker = async (request) => {
    try {
      const response = await api.getRequest(request.id)
      const details = response.data
      const typeLabels = { motorcycle: 'Motorcycle', car: 'Car', suv: 'SUV', van: 'Van', tricycle: 'Tricycle', other: 'Other' }
      const vehicleCode = details.sticker?.vehicle_code?.replace(/^[^-]+-/, '') || request.plateNumber

      setGeneratedSticker({
        ...request,
        requestId: request.id,
        vehicleType: typeLabels[details.vehicle_type?.toLowerCase()] || details.vehicle_type,
        vehicleCode,
        price: details.sticker?.price,
        month: details.sticker?.valid_month,
        year: String(details.sticker?.valid_year || ''),
        serialNumber: details.sticker?.serial_number,
        generatedDate: details.sticker?.generated_at || request.submittedDate,
        generatedTime: '',
        // A completed sticker can be reopened and printed again, but it must
        // remain completed so the staff member is not prompted to mark it
        // printed a second time.
        status: request.status === 'completed' ? 'completed' : 'generated',
      })
      setCurrentPage('preview')
    } catch (error) {
      setFeedback({ type: 'error', message: `Failed to open generated sticker: ${error.message}` })
    }
  }

  const handleBack = () => {
    setCurrentPage('list')
    setSelectedRequest(null)
    setGeneratedSticker(null)
  }

  return (
    <div className="App">
      {currentPage !== 'detail' && (
        <RequestList 
          requests={requests}
          onViewRequest={handleViewRequest}
          onApprove={handleApprove}
          onOpenGenerated={handleOpenGeneratedSticker}
          loading={loading}
        />
      )}

      {error && (
        <div className="App">
          <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>⚠️</div>
            <h2 style={{fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px'}}>Connection Error</h2>
            <p style={{color: '#6b7280', marginBottom: '16px'}}>{error}</p>
            <button 
              onClick={fetchRequests}
              className="button-primary"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {currentPage === 'detail' && (
            <RequestDetail 
              request={selectedRequest}
              onBack={handleBack}
              onApprove={handleApprove}
              onDecline={handleDecline}
            />
          )}

          {currentPage === 'customize' && (
            <WorkflowModal title="Customize sticker" onClose={handleBack}>
              <StickerCustomization 
                request={selectedRequest}
                onBack={handleBack}
                onGenerate={handleGenerateSticker}
              />
            </WorkflowModal>
          )}

          {currentPage === 'preview' && (
            <WorkflowModal title="Generated sticker" onClose={handleBack}>
              <StickerPreview 
                sticker={generatedSticker}
                onBack={handleBack}
                onMarkPrinted={handleMarkPrinted}
              />
            </WorkflowModal>
          )}
        </>
      )}
      {feedback && (
        <FeedbackModal
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}
    </div>
  )
}

const FeedbackModal = ({ type, message, onClose }) => {
  const isError = type === 'error'

  return (
    <div className="modal-overlay workflow-overlay" onClick={onClose} role="presentation">
      <section
        className="modal-content workflow-modal-content"
        onClick={(event) => event.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
      >
        <div className="workflow-modal-header no-print">
          <div>
            <p className="eyebrow">Sticker workflow</p>
            <h2 id="feedback-modal-title">{isError ? 'Action failed' : 'Update complete'}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close notification">
            <X size={20} />
          </button>
        </div>
        <div className="workflow-modal-body">
          <p className={isError ? 'text-red-700' : 'text-emerald-700'}>{message}</p>
          <div className="mt-6 flex justify-end">
            <button className="button-primary" onClick={onClose}>OK</button>
          </div>
        </div>
      </section>
    </div>
  )
}

const WorkflowModal = ({ title, children, onClose = () => {} }) => (
  <div className="modal-overlay workflow-overlay" onClick={onClose}>
    <section className="modal-content workflow-modal-content" onClick={(event) => event.stopPropagation()} aria-modal="true" role="dialog" aria-label={title}>
      <div className="workflow-modal-header no-print">
        <div>
          <p className="eyebrow">Sticker workflow</p>
          <h2>{title}</h2>
        </div>
        <button className="modal-close" onClick={onClose} aria-label={`Close ${title}`}>
          <X size={20} />
        </button>
      </div>
      <div className="workflow-modal-body">{children}</div>
    </section>
  </div>
)

export default App
