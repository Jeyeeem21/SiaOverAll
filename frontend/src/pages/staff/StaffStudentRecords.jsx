import { useState, useEffect, useCallback } from 'react'
import { apiRequest } from '../../api/client'
import Toast from '../../components/Toast'
import ConfirmationModal from '../../components/ConfirmationModal'

export default function StaffStudentRecords() {
  // State management
  const [students, setStudents] = useState([])
  const [idCardsByStudent, setIdCardsByStudent] = useState({})
  const [filterOptions, setFilterOptions] = useState({
    programs: [],
    year_levels: [],
    departments: []
  })
  const [summary, setSummary] = useState({
    total_students: 0,
    verified_students: 0,
    pending_verification: 0
  })
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  })

  // Filter and search state
  const [filters, setFilters] = useState({
    search: '',
    program: '',
    year_level: '',
    department: '',
    verification_status: ''
  })

  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [editingStudent, setEditingStudent] = useState(null)
  const [requestingStudentId, setRequestingStudentId] = useState(null)
  const [studentRequestConfirmation, setStudentRequestConfirmation] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    student_id_number: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    program: '',
    year_level: '',
    section: '',
    department: '',
    email: '',
    contact_number: '',
    verification_status: 'pending',
    photo: null
  })

  // Load students data
  const loadStudents = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams({
        page: page.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      })

      const [response, cardsResponse] = await Promise.all([
        apiRequest(`/students?${params}`),
        apiRequest('/student-id-cards')
      ])
      
      setStudents(response.data || [])
      setIdCardsByStudent(
        (cardsResponse.data || []).reduce((cards, card) => {
          if (!cards[card.student_id]) {
            cards[card.student_id] = card
          }
          return cards
        }, {})
      )
      setFilterOptions(response.filter_options || { programs: [], year_levels: [], departments: [] })
      setSummary(response.summary || { total_students: 0, verified_students: 0, pending_verification: 0 })
      
      if (response.meta) {
        setPagination({
          current_page: response.meta.current_page,
          last_page: response.meta.last_page,
          per_page: response.meta.per_page,
          total: response.meta.total
        })
      }
    } catch (err) {
      setError(err.message || 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadStudents()
  }, [loadStudents])

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      program: '',
      year_level: '',
      department: '',
      verification_status: ''
    })
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'photo') {
      setFormData(prev => ({ ...prev, photo: files[0] }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  // Open add form
  const openAddForm = () => {
    setEditingStudent(null)
    setFormData({
      student_id_number: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      program: '',
      year_level: '',
      section: '',
      department: '',
      email: '',
      contact_number: '',
      verification_status: 'pending',
      photo: null
    })
    setShowForm(true)
    setError('')
    setNotice('')
  }

  // Open edit form
  const openEditForm = (student) => {
    setEditingStudent(student)
    setFormData({
      student_id_number: student.student_id_number || '',
      first_name: student.first_name || '',
      middle_name: student.middle_name || '',
      last_name: student.last_name || '',
      program: student.program || '',
      year_level: student.year_level || '',
      section: student.section || '',
      department: student.department || '',
      email: student.email || '',
      contact_number: student.contact_number || '',
      verification_status: student.verification_status || 'pending',
      photo: null
    })
    setShowForm(true)
    setError('')
    setNotice('')
  }

  // View student details
  const viewStudent = (student) => {
    setSelectedStudent(student)
    setShowViewModal(true)
  }

  // Handle form submit (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')

    try {
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          submitData.append(key, value)
        }
      })

      if (editingStudent) {
        // Update existing student
        await apiRequest(`/students/${editingStudent.id}`, {
          method: 'POST',
          body: submitData,
          headers: { 'X-HTTP-Method-Override': 'PATCH' }
        })
        setNotice('Student record updated successfully!')
      } else {
        // Create new student
        await apiRequest('/students', {
          method: 'POST',
          body: submitData
        })
        setNotice('Student record created successfully!')
      }

      setShowForm(false)
      await loadStudents(pagination.current_page)
    } catch (err) {
      setError(err.message || 'Failed to save student record')
    }
  }

  // Delete student
  const deleteStudent = async (student) => {
    if (!window.confirm(`Are you sure you want to delete ${student.first_name} ${student.last_name}? This action cannot be undone.`)) {
      return
    }

    try {
      setError('')
      await apiRequest(`/students/${student.id}`, { method: 'DELETE' })
      setNotice('Student record deleted successfully!')
      await loadStudents(pagination.current_page)
    } catch (err) {
      setError(err.message || 'Failed to delete student record')
    }
  }

  const requestId = async (student) => {
    try {
      setStudentRequestConfirmation(null)
      setRequestingStudentId(student.id)
      setError('')
      await apiRequest(`/students/${student.id}/id-card-request`, { method: 'POST' })
      setNotice(`ID request created for ${student.full_name}.`)
      await loadStudents(pagination.current_page)
    } catch (err) {
      setError(err.message || 'Failed to create ID request')
    } finally {
      setRequestingStudentId(null)
    }
  }

  const visibleStudents = filters.verification_status
    ? students.filter(student => student.verification_status === filters.verification_status)
    : students

  return (
    <div className="student-records-page">
      {/* Page Header */}
      <div className="records-header bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Records</h1>
            <p className="text-sm text-gray-500 mt-2">Manage all student information and records</p>
          </div>
          <button
            onClick={openAddForm}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Student
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="text-sm font-medium text-blue-600">Total Students</div>
            <div className="text-3xl font-bold text-blue-900 mt-1">{summary.total_students}</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <div className="text-sm font-medium text-green-600">Verified</div>
            <div className="text-3xl font-bold text-green-900 mt-1">{summary.verified_students}</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-4">
            <div className="text-sm font-medium text-amber-600">Pending Verification</div>
            <div className="text-3xl font-bold text-amber-900 mt-1">{summary.pending_verification}</div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <Toast type="error" message={error} onClose={() => setError('')} />
      <Toast type="success" message={notice} onClose={() => setNotice('')} />
      <ConfirmationModal
        title="Request student ID"
        message={studentRequestConfirmation ? `Create an ID request for ${studentRequestConfirmation.full_name}?` : ''}
        confirmText="Request ID"
        onConfirm={() => requestId(studentRequestConfirmation)}
        onCancel={() => setStudentRequestConfirmation(null)}
      />

      {/* Filters and Search */}
      <div className="records-filters bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search & Filter</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search Bar */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name or student ID number..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {filterOptions.departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Program Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
            <select
              value={filters.program}
              onChange={(e) => handleFilterChange('program', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">All Programs</option>
              {filterOptions.programs.map(prog => (
                <option key={prog} value={prog}>{prog}</option>
              ))}
            </select>
          </div>

          {/* Year Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year Level</label>
            <select
              value={filters.year_level}
              onChange={(e) => handleFilterChange('year_level', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">All Years</option>
              {filterOptions.year_levels.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <select
                value={filters.verification_status}
                onChange={(e) => handleFilterChange('verification_status', e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </label>
          </div>

          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="records-table bg-white">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading students...</div>
            </div>
          ) : visibleStudents.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new student record.</p>
              <button
                onClick={openAddForm}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Add First Student
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year & Section</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Request</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visibleStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {student.photo_url ? (
                        <img
                          src={student.photo_url}
                          alt={student.full_name}
                          className="record-photo rounded-full object-cover"
                        />
                      ) : (
                        <div className="record-avatar rounded-full bg-gradient-to-br from-emerald-200 to-emerald-400 flex items-center justify-center text-white font-semibold">
                          {student.first_name?.[0]}{student.last_name?.[0]}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.student_id_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                      <div className="mt-1 text-xs font-medium capitalize text-gray-500">Verification: {student.verification_status}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.program}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.year_level} - {student.section}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <IdRequestAction
                        card={idCardsByStudent[student.id]}
                        isRequesting={requestingStudentId === student.id}
                        onRequest={() => setStudentRequestConfirmation(student)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewStudent(student)}
                          className="record-action text-blue-600 hover:bg-blue-50 hover:text-blue-900"
                          title="View"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openEditForm(student)}
                          className="record-action text-emerald-600 hover:bg-emerald-50 hover:text-emerald-900"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteStudent(student)}
                          className="record-action text-amber-600 hover:bg-amber-50 hover:text-amber-900"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => loadStudents(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => loadStudents(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="app-modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="app-modal-panel bg-white max-w-4xl" onClick={(e) => e.stopPropagation()}>
            {/* Simple Header */}
            <div className="app-modal-header flex items-center justify-between bg-white">
              <h2 className="text-2xl font-semibold text-gray-900">
                {editingStudent ? 'Edit Student Record' : 'Add New Student'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content with Side Margin */}
            <div className="app-modal-body">
              <form onSubmit={handleSubmit} className="space-y-8">
              {/* Student ID Number Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-5 pb-2 border-b border-gray-200">Student Identification</h3>
                <div className="mt-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student ID Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="student_id_number"
                      value={formData.student_id_number}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., MBC2023-00562"
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">Manually enter student's ID number</p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-5 pb-2 border-b border-gray-200">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Middle Initial
                    </label>
                    <input
                      type="text"
                      name="middle_name"
                      value={formData.middle_name}
                      onChange={handleInputChange}
                      maxLength="1"
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-5 pb-2 border-b border-gray-200">Academic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., College of Engineering"
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Program/Course <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="program"
                      value={formData.program}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., BS Computer Science"
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="year_level"
                      value={formData.year_level}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    >
                      <option value="">Select Year Level</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., A, B, 1-A"
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-5 pb-2 border-b border-gray-200">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="student@example.com"
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleInputChange}
                      placeholder="09XX-XXX-XXXX"
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Photo & Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-5 pb-2 border-b border-gray-200">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Photo
                    </label>
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">Upload a clear photo (JPG, PNG)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="verification_status"
                      value={formData.verification_status}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    >
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                      <option value="unverified">Unverified</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
            </div>

            {/* Footer Buttons */}
            <div className="app-modal-footer flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  const form = e.target.closest('.bg-white').querySelector('form');
                  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                }}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                {editingStudent ? 'Update Student' : 'Add Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {showViewModal && selectedStudent && (
        <div className="app-modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowViewModal(false)}>
          <div className="app-modal-panel bg-white max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {/* Simple Header */}
            <div className="app-modal-header flex items-center justify-between bg-white">
              <h2 className="text-2xl font-semibold text-gray-900">Student Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content with Side Margin */}
            <div className="app-modal-body">
              <div className="space-y-8">
              {/* Photo and Basic Info */}
              <div className="flex items-start gap-6 pb-6 border-b border-gray-200">
                {selectedStudent.photo_url ? (
                  <img
                    src={selectedStudent.photo_url}
                    alt={selectedStudent.full_name}
                    className="w-28 h-28 rounded-lg object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold">
                    {selectedStudent.first_name?.[0]}{selectedStudent.last_name?.[0]}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900">{selectedStudent.full_name}</h3>
                  <p className="text-gray-600 mt-1">{selectedStudent.student_id_number}</p>
                  <div className="mt-3">
                    <span className={`px-3 py-1.5 inline-flex text-xs font-semibold rounded-full ${
                      selectedStudent.verification_status === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : selectedStudent.verification_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedStudent.verification_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Academic Information</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-4">
                  <DetailRow label="Department" value={selectedStudent.department} />
                  <DetailRow label="Program" value={selectedStudent.program} />
                  <DetailRow label="Year Level" value={selectedStudent.year_level} />
                  <DetailRow label="Section" value={selectedStudent.section} />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Contact Information</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-4">
                  <DetailRow label="Email" value={selectedStudent.email} />
                  <DetailRow label="Contact Number" value={selectedStudent.contact_number} />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Record Information</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-4">
                  <DetailRow label="Student ID Number" value={selectedStudent.student_id_number} />
                  <DetailRow label="Created Date" value={new Date(selectedStudent.created_at).toLocaleDateString()} />
                  <DetailRow label="Last Updated" value={new Date(selectedStudent.updated_at).toLocaleDateString()} />
                </div>
              </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="app-modal-footer flex gap-3">
              <button
                onClick={() => {
                  setShowViewModal(false)
                  openEditForm(selectedStudent)
                }}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Edit Student
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors font-medium"
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

function DetailRow({ label, value }) {
  return (
    <div>
      <div className="text-xs font-medium text-gray-500 mb-1">{label}</div>
      <div className="text-sm text-gray-900">{value || '—'}</div>
    </div>
  )
}

function IdRequestAction({ card, isRequesting, onRequest }) {
  if (!card) {
    return (
      <button
        onClick={onRequest}
        disabled={isRequesting}
        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isRequesting ? 'Requesting...' : 'Request ID'}
      </button>
    )
  }

  const status = {
    requested: { label: 'ID Requested', className: 'bg-amber-100 text-amber-800' },
    approved: { label: 'ID Approved', className: 'bg-blue-100 text-blue-800' },
    printed: { label: 'ID Ready', className: 'bg-violet-100 text-violet-800' },
    released: { label: 'ID Released', className: 'bg-emerald-100 text-emerald-800' },
  }[card.status] || { label: `ID ${card.status}`, className: 'bg-gray-100 text-gray-800' }

  return (
    <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}>
      {status.label}
    </span>
  )
}
