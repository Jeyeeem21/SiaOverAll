import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '../../api/client'
import Toast from '../Toast'

const API_BASE_URL = 'http://localhost:8000'

const DOCUMENT_TYPES = [
  { value: 'birth_certificate', label: 'Birth Certificate', icon: '📜' },
  { value: 'transcript', label: 'Transcript of Records', icon: '📋' },
  { value: 'clearance', label: 'Clearance', icon: '✅' },
  { value: 'medical_record', label: 'Medical Record', icon: '🏥' },
  { value: 'id_copy', label: 'ID Copy', icon: '🪪' },
  { value: 'other', label: 'Other Document', icon: '📄' },
]

export default function StudentDocuments() {
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [documentUpload, setDocumentUpload] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const canManage = ['Admin', 'Staff'].includes(currentUser?.role)

  useEffect(() => {
    let active = true
    apiRequest('/user')
      .then((user) => { if (active) setCurrentUser(user) })
      .catch(() => { if (active) setCurrentUser(null) })
    return () => { active = false }
  }, [])

  const loadStudents = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await apiRequest('/students')
      setStudents(response.data ?? [])
    } catch (err) {
      setError(err.message || 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadStudents()
  }, [loadStudents])

  async function loadDocuments(studentId) {
    try {
      const response = await apiRequest(`/students/${studentId}/documents`)
      setDocuments(response.data ?? [])
    } catch (err) {
      console.error('Error loading documents:', err)
      setDocuments([])
    }
  }

  async function selectStudent(student) {
    setSelectedStudent(student)
    setPhotoPreview(student.photo_url)
    await loadDocuments(student.id)
  }

  async function uploadPhoto(file) {
    if (!canManage || !selectedStudent) return
    
    setUploadingPhoto(true)
    setError('')
    setNotice('')
    
    const formData = new FormData()
    formData.append('photo', file)

    try {
      const response = await apiRequest(`/students/${selectedStudent.id}/photo`, {
        method: 'POST',
        body: formData
      })
      setNotice('Photo uploaded successfully')
      setPhotoPreview(response.data.photo_url)
      // Update student in list
      setStudents(prev => prev.map(s => 
        s.id === selectedStudent.id ? { ...s, photo_url: response.data.photo_url, photo_path: response.data.photo_path } : s
      ))
      setSelectedStudent(prev => ({ ...prev, photo_url: response.data.photo_url, photo_path: response.data.photo_path }))
    } catch (err) {
      setError(err.message || 'Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function deletePhoto() {
    if (!canManage || !selectedStudent || !window.confirm('Delete this photo?')) return
    
    setError('')
    setNotice('')
    
    try {
      await apiRequest(`/students/${selectedStudent.id}/photo`, { method: 'DELETE' })
      setNotice('Photo deleted successfully')
      setPhotoPreview(null)
      setStudents(prev => prev.map(s => 
        s.id === selectedStudent.id ? { ...s, photo_url: null, photo_path: null } : s
      ))
      setSelectedStudent(prev => ({ ...prev, photo_url: null, photo_path: null }))
    } catch (err) {
      setError(err.message || 'Failed to delete photo')
    }
  }

  async function uploadDocument(file, docType, docName, notes) {
    if (!canManage || !selectedStudent) return
    
    setUploadingDoc(true)
    setError('')
    setNotice('')
    
    const formData = new FormData()
    formData.append('document', file)
    formData.append('document_type', docType)
    if (docName) formData.append('document_name', docName)
    if (notes) formData.append('notes', notes)

    try {
      await apiRequest(`/students/${selectedStudent.id}/documents`, {
        method: 'POST',
        body: formData
      })
      setNotice('Document uploaded successfully')
      setDocumentUpload(null)
      await loadDocuments(selectedStudent.id)
    } catch (err) {
      setError(err.message || 'Failed to upload document')
    } finally {
      setUploadingDoc(false)
    }
  }

  async function deleteDocument(docId) {
    if (!canManage || !window.confirm('Delete this document?')) return
    
    setError('')
    setNotice('')
    
    try {
      await apiRequest(`/students/${selectedStudent.id}/documents/${docId}`, { method: 'DELETE' })
      setNotice('Document deleted successfully')
      await loadDocuments(selectedStudent.id)
    } catch (err) {
      setError(err.message || 'Failed to delete document')
    }
  }

  function handlePhotoSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(file.type)) {
      setError('Only JPG, JPEG, and PNG formats are accepted')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo size must not exceed 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Upload
    uploadPhoto(file)
  }

  const filteredStudents = students.filter(student =>
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id_number?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-50">
      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
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
            <button onClick={() => window.location.href = '/id-cards'} className="px-6 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 transition-colors whitespace-nowrap">
              ID Cards
            </button>
            <button onClick={() => window.location.href = '/id-requests'} className="px-6 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 transition-colors whitespace-nowrap">
              ID Requests
            </button>
            <button onClick={() => window.location.href = '/release-history'} className="px-6 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 transition-colors whitespace-nowrap">
              Release History
            </button>
            <button className="px-6 py-3 text-sm font-medium text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50 whitespace-nowrap">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Students</h2>
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-3 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
                />
              </div>
              <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">No students found</div>
                ) : (
                  filteredStudents.map(student => (
                    <button
                      key={student.id}
                      onClick={() => selectStudent(student)}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left ${
                        selectedStudent?.id === student.id ? 'bg-emerald-50' : ''
                      }`}
                    >
                      {student.photo_url ? (
                        <img src={student.photo_url} alt={student.full_name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {student.first_name?.[0]}{student.last_name?.[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate text-sm">{student.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{student.student_id_number}</p>
                      </div>
                      {student.photo_path && (
                        <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-2">
            {selectedStudent ? (
              <div className="space-y-6">
                {/* Alerts */}
                <Toast type="error" message={error} onClose={() => setError('')} />
                <Toast type="success" message={notice} onClose={() => setNotice('')} />

                {/* Photo Section */}
                <PhotoSection
                  student={selectedStudent}
                  photoPreview={photoPreview}
                  uploading={uploadingPhoto}
                  canManage={canManage}
                  onPhotoSelect={handlePhotoSelect}
                  onDelete={deletePhoto}
                />

                {/* Documents Section */}
                <DocumentsSection
                  student={selectedStudent}
                  documents={documents}
                  uploading={uploadingDoc}
                  canManage={canManage}
                  onUpload={() => setDocumentUpload({})}
                  onDelete={deleteDocument}
                />
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Student Selected</h3>
                <p className="text-sm text-gray-500">Select a student from the list to manage photos and documents</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Document Upload Modal */}
      {documentUpload && (
        <DocumentUploadModal
          onClose={() => setDocumentUpload(null)}
          onUpload={uploadDocument}
          uploading={uploadingDoc}
        />
      )}
    </div>
  )
}

function PhotoSection({ student, photoPreview, uploading, canManage, onPhotoSelect, onDelete }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Student Photo</h3>
        {student.photo_path && canManage && (
          <button
            onClick={onDelete}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Delete Photo
          </button>
        )}
      </div>
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt={student.full_name}
                className="w-48 h-48 rounded-2xl object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold text-6xl border-4 border-white shadow-lg">
                {student.first_name?.[0]}{student.last_name?.[0]}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">{student.full_name}</h4>
            <p className="text-sm text-gray-500 mb-4">{student.student_id_number}</p>
            
            {canManage && (
              <div className="space-y-3">
                <label className="block">
                  <span className="sr-only">Choose photo</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={onPhotoSelect}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 file:cursor-pointer cursor-pointer disabled:opacity-50"
                  />
                </label>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs text-blue-700 font-medium mb-2">Photo Requirements:</p>
                  <ul className="text-xs text-blue-600 space-y-1">
                    <li>• Formats: JPG, JPEG, PNG only</li>
                    <li>• Max size: 5MB</li>
                    <li>• Min dimensions: 200x200 pixels</li>
                    <li>• Photo will be used for ID cards</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DocumentsSection({ student, documents, uploading, canManage, onUpload, onDelete }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Supporting Documents</h3>
        {canManage && (
          <button
            onClick={onUpload}
            disabled={uploading}
            className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-all disabled:opacity-50"
          >
            + Upload Document
          </button>
        )}
      </div>
      <div className="p-6">
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="text-sm text-gray-500">No documents uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map(doc => (
              <DocumentCard key={doc.id} document={doc} canManage={canManage} onDelete={onDelete} studentId={student.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DocumentCard({ document, canManage, onDelete, studentId }) {
  const docType = DOCUMENT_TYPES.find(t => t.value === document.document_type)
  
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="text-3xl">{docType?.icon || '📄'}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{document.document_name || document.original_filename}</p>
        <p className="text-xs text-gray-500">{docType?.label || document.document_type} • {document.formatted_size}</p>
        {document.notes && <p className="text-xs text-gray-600 mt-1 italic">{document.notes}</p>}
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <a
          href={`${API_BASE_URL}/api/students/${studentId}/documents/${document.id}/download`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-all"
        >
          Download
        </a>
        {canManage && (
          <button
            onClick={() => onDelete(document.id)}
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-all"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}

function DocumentUploadModal({ onClose, onUpload, uploading }) {
  const [file, setFile] = useState(null)
  const [docType, setDocType] = useState('other')
  const [docName, setDocName] = useState('')
  const [notes, setNotes] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!file) return
    onUpload(file, docType, docName, notes)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Document Type *</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
            >
              {DOCUMENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Document Name</label>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="Optional custom name"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">File *</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 file:cursor-pointer"
            />
            <p className="mt-2 text-xs text-gray-500">PDF, JPG, JPEG, PNG, DOC, DOCX • Max 10MB</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional notes about this document"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-all disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
