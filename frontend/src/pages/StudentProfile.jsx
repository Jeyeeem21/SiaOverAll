import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { apiRequest } from '../api/client'
import EditableIdCardPreview from '../components/student-id/EditableIdCardPreview'

const API_BASE_URL = 'http://localhost:8000'

export default function StudentProfile() {
  const { id } = useParams()
  const [student, setStudent] = useState(null)
  const [idCard, setIdCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('preview') // 'preview' is now the main tab

  useEffect(() => {
    loadStudentData()
  }, [id])

  async function loadStudentData() {
    setLoading(true)
    setError('')
    try {
      const studentRes = await apiRequest(`/students/${id}`)
      setStudent(studentRes.data)
      
      // Try to load the student's ID card
      try {
        const cardsRes = await apiRequest(`/student-id-cards`)
        const studentCard = cardsRes.data?.find(card => card.student_id === parseInt(id))
        setIdCard(studentCard)
      } catch {
        // No ID card yet, that's fine
        setIdCard(null)
      }
    } catch (err) {
      setError(err.message || 'Failed to load student data')
    } finally {
      setLoading(false)
    }
  }

  function handleInfoUpdate(updatedStudent) {
    setStudent(updatedStudent)
    loadStudentData()
  }

  function handleSignatureUpload() {
    loadStudentData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading student profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl">
          <div className="text-red-500 text-center mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-all"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  if (!student) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-50">
      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => window.location.href = '/'}
                className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Student Profile</h1>
                <p className="text-xs text-gray-500">{student.full_name}</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Student Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <div className="text-center mb-6">
                {student.photo_url ? (
                  <img 
                    src={student.photo_url} 
                    alt={student.full_name}
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-emerald-100 shadow-md"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full mx-auto bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-4xl border-4 border-emerald-100">
                    {student.first_name?.[0]}{student.last_name?.[0]}
                  </div>
                )}
                <h2 className="mt-4 text-xl font-bold text-gray-900">{student.full_name}</h2>
                <p className="text-sm text-gray-500 mt-1">{student.student_id_number}</p>
                <span className={`inline-block mt-3 px-4 py-1.5 rounded-full text-xs font-semibold ${
                  student.verification_status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                  student.verification_status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {student.verification_status?.toUpperCase()}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <InfoRow label="Program" value={student.program} />
                <InfoRow label="Year Level" value={student.year_level} />
                <InfoRow label="Section" value={student.section} />
                <InfoRow label="Department" value={student.department} />
                <InfoRow label="Email" value={student.email} />
                <InfoRow label="Contact" value={student.contact_number} />
              </div>

              {idCard && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700">ID Card Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      idCard.status === 'released' ? 'bg-emerald-100 text-emerald-700' :
                      idCard.status === 'printed' ? 'bg-violet-100 text-violet-700' :
                      idCard.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {idCard.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Card #: {idCard.card_number}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-2">
            {/* Editable ID Card Preview */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8">
              <EditableIdCardPreview
                student={student}
                idCard={idCard}
                onUpdate={loadStudentData}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className="text-gray-900 font-semibold text-right">{value || '—'}</span>
    </div>
  )
}
