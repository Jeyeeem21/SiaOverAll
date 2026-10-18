import Navigation from '../components/Navigation';
import { useStudentDocuments } from '../hooks/useStudentData';

const Verification = () => {
  const { documents, loading, error, uploadDocument } = useStudentDocuments();

  return (
    <>
      <Navigation userRole="student" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        
        <header className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-3xl font-bold text-gray-900">Document Verification</h1>
              <p className="mt-1 text-sm text-gray-600">
                Upload and manage your verification documents
              </p>
            </div>
          </div>
        </header>

        <main className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Upload Section */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Upload Documents</h2>
            </div>
            <div className="px-6 py-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600 cursor-pointer">Upload a file</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Submitted Documents</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="px-6 py-4 text-center text-gray-500">Loading documents...</div>
              ) : documents && documents.length > 0 ? (
                documents.map((doc, index) => (
                  <div key={index} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{doc.original_name}</div>
                        <div className="text-sm text-gray-500">{doc.document_type}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                        doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">No documents uploaded yet.</p>
                  <p className="text-xs text-gray-400">Upload your first document to get started.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Verification;