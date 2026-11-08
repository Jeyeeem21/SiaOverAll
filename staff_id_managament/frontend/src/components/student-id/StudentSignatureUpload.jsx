import { useState } from 'react'
import { apiRequest } from '../../api/client'

export default function StudentSignatureUpload({ student, onSuccess }) {
  const [signatureFile, setSignatureFile] = useState(null)
  const [signaturePreview, setSignaturePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('File size must be less than 2MB')
        return
      }
      setSignatureFile(file)
      setSignaturePreview(URL.createObjectURL(file))
      setError('')
    }
  }

  const handleUpload = async () => {
    if (!signatureFile) {
      setError('Please select a signature image')
      return
    }

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('signature', signatureFile)

    // Add existing student data to prevent validation errors
    if (student) {
      Object.entries(student).forEach(([key, value]) => {
        if (value && key !== 'id' && key !== 'photo_url' && key !== 'signature_url' && key !== 'full_name' && key !== 'created_at' && key !== 'updated_at' && key !== 'deleted_at' && key !== 'user_id') {
          formData.append(key, value)
        }
      })
    }

    try {
      await apiRequest(`/students/${student.id}`, {
        method: 'POST',
        body: formData,
        headers: {
          'X-HTTP-Method-Override': 'PATCH'
        }
      })
      setSignatureFile(null)
      setSignaturePreview(null)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.message || 'Failed to upload signature')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Your E-Signature</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {student?.signature_url && !signaturePreview && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Current signature:</p>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <img 
              src={student.signature_url} 
              alt="Current signature" 
              className="max-h-20 mx-auto"
            />
          </div>
        </div>
      )}

      {signaturePreview && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Preview:</p>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <img 
              src={signaturePreview} 
              alt="Signature preview" 
              className="max-h-20 mx-auto"
            />
          </div>
        </div>
      )}

      <div className="mb-4">
        <input
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleFileSelect}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 file:font-medium hover:file:bg-gray-200"
        />
        <p className="mt-2 text-xs text-gray-500">
          Upload a clear image of your signature (PNG, JPG, JPEG - Max 2MB)
        </p>
      </div>

      <button
        onClick={handleUpload}
        disabled={!signatureFile || uploading}
        className="w-full px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {uploading ? (
          <>
            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Uploading...
          </>
        ) : (
          'Upload Signature'
        )}
      </button>
    </div>
  )
}
