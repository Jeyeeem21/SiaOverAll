import { useState, useEffect } from 'react'
import { apiRequest } from '../../api/client'

const API_BASE_URL = 'http://localhost:8000'

export default function EditableIdCardPreview({ student, idCard, onUpdate }) {
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    student_id_number: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    program: '',
    year_level: '',
    section: '',
    department: '',
    address: '',
    birthdate: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
  })
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [signatureFile, setSignatureFile] = useState(null)
  const [signaturePreview, setSignaturePreview] = useState(null)

  useEffect(() => {
    if (student) {
      setFormData({
        student_id_number: student.student_id_number || '',
        first_name: student.first_name || '',
        middle_name: student.middle_name || '',
        last_name: student.last_name || '',
        program: student.program || '',
        year_level: student.year_level || '',
        section: student.section || '',
        department: student.department || '',
        address: student.address || '',
        birthdate: student.birthdate || '',
        emergency_contact_name: student.emergency_contact_name || '',
        emergency_contact_number: student.emergency_contact_number || '',
      })
    }
  }, [student])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleSignatureChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSignatureFile(file)
      setSignaturePreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const updateFormData = new FormData()
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          updateFormData.append(key, value)
        }
      })

      // Add files if selected
      if (photoFile) {
        updateFormData.append('photo', photoFile)
      }
      if (signatureFile) {
        updateFormData.append('signature', signatureFile)
      }

      await apiRequest(`/students/${student.id}`, {
        method: 'POST',
        body: updateFormData,
        headers: {
          'X-HTTP-Method-Override': 'PATCH'
        }
      })

      setSuccess('Student information updated successfully!')
      setEditMode(false)
      setPhotoFile(null)
      setPhotoPreview(null)
      setSignatureFile(null)
      setSignaturePreview(null)
      
      if (onUpdate) {
        setTimeout(() => onUpdate(), 500)
      }
    } catch (err) {
      setError(err.message || 'Failed to update information')
    } finally {
      setSaving(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const photoUrl = photoPreview || student?.photo_url
  const signatureUrl = signaturePreview || student?.signature_url

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${editMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
          <span className="font-semibold text-gray-900">
            {editMode ? 'Edit Mode - Click fields to change' : 'Preview Mode'}
          </span>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button
                onClick={() => {
                  setEditMode(false)
                  setPhotoPreview(null)
                  setSignaturePreview(null)
                  setPhotoFile(null)
                  setSignatureFile(null)
                }}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Information
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start">
          <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start">
          <svg className="w-5 h-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-emerald-700">{success}</p>
        </div>
      )}

      {/* ID Cards Side by Side */}
      <div className="flex gap-8 justify-center flex-wrap lg:flex-nowrap">
        {/* FRONT CARD */}
        <div className="w-full max-w-[450px]">
          <div className="text-sm font-semibold text-gray-700 mb-3 text-center">FRONT SIDE</div>
          <div className="id-card-front bg-[#1e5956] rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-[#0f3d3a] px-6 py-4 text-center text-white">
              <div className="text-base font-bold tracking-wider mb-1">MINDORO STATE UNIVERSITY</div>
              <div className="text-[9px] tracking-wide opacity-95 mb-2">ORIENTAL MINDORO, PHILIPPINES 5211</div>
              <div className="text-[11px] font-bold tracking-wider">STUDENT IDENTIFICATION CARD</div>
            </div>

            {/* Body */}
            <div className="flex gap-5 p-6">
              {/* Photo */}
              <div className="flex-shrink-0 relative group">
                <div className="w-24 h-24 bg-white border-4 border-yellow-400 overflow-hidden flex items-center justify-center">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400 text-xs text-center p-2">No Photo</div>
                  )}
                </div>
                {editMode && (
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-white">
                {editMode ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => handleChange('last_name', e.target.value)}
                      placeholder="Last Name"
                      className="w-full px-2 py-1 text-lg font-bold bg-white/10 border border-yellow-400 rounded text-white placeholder-white/50"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => handleChange('first_name', e.target.value)}
                        placeholder="First Name"
                        className="flex-1 px-2 py-1 text-sm font-bold bg-white/10 border border-yellow-400 rounded text-white placeholder-white/50"
                      />
                      <input
                        type="text"
                        value={formData.middle_name}
                        onChange={(e) => handleChange('middle_name', e.target.value)}
                        placeholder="M.I."
                        className="w-16 px-2 py-1 text-sm font-bold bg-white/10 border border-yellow-400 rounded text-white placeholder-white/50"
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.program}
                      onChange={(e) => handleChange('program', e.target.value)}
                      placeholder="Program"
                      className="w-full px-2 py-1 text-base font-bold bg-white/10 border border-yellow-400 rounded text-white placeholder-white/50"
                    />
                  </div>
                ) : (
                  <>
                    <div className="text-xl font-bold leading-tight border-b-2 border-yellow-400 pb-2 mb-2">
                      {formData.last_name?.toUpperCase() || 'LAST NAME'}<br />
                      {formData.first_name?.toUpperCase() || 'FIRST NAME'} {formData.middle_name?.[0]?.toUpperCase() || 'M'}.
                    </div>
                    <div className="text-base font-bold tracking-wide">
                      {formData.program?.toUpperCase() || 'PROGRAM'}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#0a2625] px-6 py-4 text-white space-y-2">
              <div className="flex justify-between items-baseline">
                <div className="text-[9px] font-bold tracking-wider">STUDENT ID NUMBER</div>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.student_id_number}
                    onChange={(e) => handleChange('student_id_number', e.target.value)}
                    placeholder="ID Number"
                    className="px-2 py-1 text-xs font-bold bg-white/10 border border-yellow-400 rounded text-white placeholder-white/50"
                  />
                ) : (
                  <div className="text-sm font-bold tracking-wider">{formData.student_id_number || 'ID-NUMBER'}</div>
                )}
              </div>
              <div className="flex justify-between items-baseline">
                <div className="text-[9px] font-bold tracking-wider">ISSUED</div>
                <div className="text-sm font-bold tracking-wider">AY {currentYear}-{currentYear + 1}</div>
              </div>
              <div className="text-center pt-3 border-t border-yellow-400/30">
                <div className="text-[8px] opacity-90">University President</div>
              </div>
            </div>
          </div>
        </div>

        {/* BACK CARD */}
        <div className="w-full max-w-[450px]">
          <div className="text-sm font-semibold text-gray-700 mb-3 text-center">BACK SIDE</div>
          <div className="id-card-back bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-200">
            <div className="p-6 space-y-4">
              {/* Address */}
              <div>
                <div className="text-[10px] font-bold text-gray-600 mb-1">Address:</div>
                {editMode ? (
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Enter full address"
                    rows="2"
                    className="w-full px-2 py-1 text-xs font-semibold text-gray-900 border-2 border-emerald-300 rounded focus:outline-none focus:border-emerald-500"
                  />
                ) : (
                  <div className="text-xs font-semibold text-gray-900">{formData.address || 'Not Provided'}</div>
                )}
              </div>

              {/* Birthday */}
              <div>
                <div className="text-[10px] font-bold text-gray-600 mb-1">Birthday:</div>
                {editMode ? (
                  <input
                    type="date"
                    value={formData.birthdate}
                    onChange={(e) => handleChange('birthdate', e.target.value)}
                    className="w-full px-2 py-1 text-xs font-semibold text-gray-900 border-2 border-emerald-300 rounded focus:outline-none focus:border-emerald-500"
                  />
                ) : (
                  <div className="text-xs font-semibold text-gray-900">
                    {formData.birthdate ? new Date(formData.birthdate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not Provided'}
                  </div>
                )}
              </div>

              {/* Emergency Contact */}
              <div className="pt-4 border-t-2 border-gray-100">
                <div className="text-[9px] italic text-gray-600 mb-2">Person to notify in case of emergency</div>
                {editMode ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.emergency_contact_name}
                      onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                      placeholder="Emergency contact name"
                      className="w-full px-2 py-1 text-xs font-semibold text-gray-900 border-2 border-emerald-300 rounded focus:outline-none focus:border-emerald-500"
                    />
                    <div>
                      <div className="text-[10px] font-bold text-gray-600 mb-1">Tel./Cell.No.</div>
                      <input
                        type="text"
                        value={formData.emergency_contact_number}
                        onChange={(e) => handleChange('emergency_contact_number', e.target.value)}
                        placeholder="Contact number"
                        className="w-full px-2 py-1 text-xs font-semibold text-gray-900 border-2 border-emerald-300 rounded focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-xs font-semibold text-gray-900">{formData.emergency_contact_name || 'Not Provided'}</div>
                    <div className="mt-2">
                      <div className="text-[10px] font-bold text-gray-600 mb-1">Tel./Cell.No.</div>
                      <div className="text-xs font-semibold text-gray-900">{formData.emergency_contact_number || 'Not Provided'}</div>
                    </div>
                  </>
                )}
              </div>

              {/* Signature */}
              <div className="pt-4 text-center relative group">
                {signatureUrl ? (
                  <div className="relative">
                    <img src={signatureUrl} alt="Signature" className="max-h-10 mx-auto" />
                    {editMode && (
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center rounded">
                        <input type="file" accept="image/*" onChange={handleSignatureChange} className="hidden" />
                        <span className="text-white text-xs font-medium">Change Signature</span>
                      </label>
                    )}
                  </div>
                ) : (
                  <div className="h-10 flex items-center justify-center">
                    {editMode ? (
                      <label className="px-4 py-2 bg-emerald-500 text-white text-xs font-medium rounded-lg cursor-pointer hover:bg-emerald-600 transition-all">
                        <input type="file" accept="image/*" onChange={handleSignatureChange} className="hidden" />
                        Upload Signature
                      </label>
                    ) : (
                      <span className="text-[9px] text-gray-400">No Signature</span>
                    )}
                  </div>
                )}
                <div className="text-[8px] text-gray-600 border-t border-gray-900 mt-2 pt-1 inline-block px-8">
                  Cardholder's Signature
                </div>
              </div>

              {/* Warning Box */}
              <div className="bg-gray-50 border-2 border-gray-900 p-3 text-center">
                <div className="text-[7.5px] leading-relaxed text-gray-900">
                  This ID card is non-transferable.<br />
                  Tampering it in any way will invalidate this<br />
                  card. This must be worn at all time when in<br />
                  campus. If lost and found, please surrender<br />
                  to MinSU immediately.
                </div>
              </div>

              {/* Registrar */}
              <div className="text-center pt-2">
                <div className="text-[11px] font-bold text-gray-900">RACHEL MARIE N. DELA CRUZ</div>
                <div className="text-[8px] text-gray-600">Registrar I</div>
              </div>

              {/* Validation */}
              <div className="pt-3 border-t border-gray-200">
                <div className="text-[8px] font-bold text-gray-700 mb-2">Validation:</div>
                <div className="grid grid-cols-5 gap-1">
                  {[...Array(5)].map((_, i) => {
                    const year1 = currentYear - 1 + i
                    const year2 = year1 + 1
                    return (
                      <div key={i} className="border border-gray-900">
                        <div className="bg-gray-100 text-[7px] font-bold text-center py-1 border-b border-gray-900">
                          {year1}-{year2}
                        </div>
                        <div className="h-5 flex items-center justify-center text-sm">
                          {i === 0 && '✓'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Barcode */}
              <div className="text-center pt-2">
                <div className="flex justify-center gap-[1px] mb-1">
                  {[...Array(30)].map((_, i) => (
                    <div key={i} className={`bg-black ${i % 3 === 0 ? 'w-1 h-8' : 'w-[2px] h-8'}`}></div>
                  ))}
                </div>
                <div className="text-[9px] font-bold tracking-widest text-gray-900">
                  {idCard?.card_number || 'CARD-NUMBER'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {!editMode && idCard && (
        <div className="flex gap-4 justify-center pt-6">
          <a
            href={`${API_BASE_URL}/student-id-cards/${idCard.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </a>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      )}
    </div>
  )
}
