import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '../../api/client'
import RoleSwitcher from '../RoleSwitcher'

const emptyFilters = { search: '', program: '', year_level: '', department: '', status: '' }
const editableFields = ['student_id_number', 'first_name', 'middle_name', 'last_name', 'program', 'year_level', 'section', 'department', 'email', 'contact_number', 'verification_status']
const blankStudent = { student_id_number: '', first_name: '', middle_name: '', last_name: '', program: '', year_level: '', section: '', department: '', email: '', contact_number: '', verification_status: 'pending' }

export default function StudentRecords() {
  const [filters, setFilters] = useState(emptyFilters)
  const [students, setStudents] = useState([])
  const [filterOptions, setFilterOptions] = useState({ programs: [], year_levels: [], departments: [] })
  const [summary, setSummary] = useState(null)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [notice, setNotice] = useState('')
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)

  const canEdit = ['Admin', 'Staff'].includes(currentUser?.role)

  useEffect(() => {
    let active = true
    apiRequest('/user').then((user) => { if (active) setCurrentUser(user) }).catch(() => { if (active) setCurrentUser(null) })
    return () => { active = false }
  }, [])

  const loadStudents = useCallback(async (page = 1) => {
    setLoading(true)
    setError('')
    const parameters = new URLSearchParams(Object.entries(filters).filter(([, value]) => value))
    parameters.set('page', String(page))
    try {
      const response = await apiRequest(`/students${parameters.toString() ? `?${parameters}` : ''}`)
      setStudents(response.data ?? [])
      setMeta(response.meta ?? { current_page: 1, last_page: 1, total: 0 })
      setSummary(response.summary ?? null)
      setFilterOptions(response.filter_options ?? { programs: [], year_levels: [], departments: [] })
    } catch (requestError) {
      setStudents([])
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    const timeout = window.setTimeout(() => { void loadStudents() }, 250)
    return () => window.clearTimeout(timeout)
  }, [loadStudents])

  function updateFilter(event) {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function clearFilters() {
    setFilters(emptyFilters)
  }

  async function viewStudent(studentId) {
    setError('')
    try {
      const response = await apiRequest(`/students/${studentId}`)
      setSelected(response.data)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function saveStudent(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (saving) return
    const isNewStudent = !editing.id
    setSaving(true)
    setFieldErrors({})
    
    // Use FormData for file uploads
    const formData = new FormData()
    editableFields.forEach((field) => {
      if (editing[field] !== null && editing[field] !== undefined && editing[field] !== '') {
        formData.append(field, editing[field])
      }
    })
    
    // Add photo if selected
    if (editing.photoFile) {
      formData.append('photo', editing.photoFile)
    }
    
    // For updates, add HTTP method override
    const headers = {}
    if (!isNewStudent) {
      headers['X-HTTP-Method-Override'] = 'PATCH'
    }
    
    try {
      await apiRequest(
        isNewStudent ? '/students' : `/students/${editing.id}`, 
        { 
          method: 'POST',
          body: formData,
          headers
        }
      )
      setEditing(null)
      setNotice(isNewStudent ? 'Student created successfully' : 'Student updated successfully')
      await loadStudents(isNewStudent ? 1 : meta.current_page)
    } catch (requestError) {
      setFieldErrors(requestError.validationErrors ?? {})
      setError(requestError.message)
    } finally { setSaving(false) }
  }

  async function deleteStudent() {
    if (!deleting || saving) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const response = await apiRequest(`/students/${deleting.id}`, { method: 'DELETE' })
      setSelected(null)
      setDeleting(null)
      setNotice(response.message ?? 'Student record deleted successfully')
      await loadStudents(students.length === 1 && meta.current_page > 1 ? meta.current_page - 1 : meta.current_page)
    } catch (requestError) {
      setError(requestError.message)
    } finally { setSaving(false) }
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== '')

  return <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
    {/* Top Navigation Bar */}
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <span className="text-xl font-semibold text-gray-800">Student Portal</span>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-900">{currentUser?.full_name || 'Admin User'}</div>
              <div className="text-xs text-gray-500">{currentUser?.role || 'Administrator'}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold shadow-sm">
              {currentUser?.full_name?.[0] || 'A'}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 -mb-px overflow-x-auto">
          <button className="px-4 lg:px-6 py-3 text-sm font-medium text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50 whitespace-nowrap">
            Students
          </button>
          <button onClick={() => window.location.href = '/id-cards'} className="px-4 lg:px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300 transition-colors whitespace-nowrap">
            ID Cards
          </button>
          <button onClick={() => window.location.href = '/id-requests'} className="px-4 lg:px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300 transition-colors whitespace-nowrap">
            ID Requests
          </button>
          <button onClick={() => window.location.href = '/release-history'} className="px-4 lg:px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300 transition-colors whitespace-nowrap">
            Release History
          </button>
          <button onClick={() => window.location.href = '/documents'} className="px-4 lg:px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300 transition-colors whitespace-nowrap">
            Documents
          </button>
          <button onClick={() => window.location.href = '/id-management'} className="px-4 lg:px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300 transition-colors whitespace-nowrap">
            ID Management
          </button>
          <button onClick={() => window.location.href = '/staff'} className="px-4 lg:px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300 transition-colors whitespace-nowrap">
            Staff
          </button>
        </div>
      </div>
    </nav>

    {/* Main Content */}
    <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-12">
      {/* Content Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 lg:px-8 py-6 lg:py-8 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Student Records</h1>
            <p className="text-sm text-gray-500 mt-2">Manage and track all student information</p>
          </div>
          <button disabled={!canEdit} onClick={() => { setError(''); setNotice(''); setEditing(blankStudent) }} className="flex items-center justify-center px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Student
          </button>
        </div>

        {/* Alerts */}
        {error && <div className="px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
            <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>}
        {notice && <div className="px-6 lg:px-8 py-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start">
            <svg className="w-5 h-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            <p className="text-sm text-emerald-700">{notice}</p>
          </div>
        </div>}

        {/* Alerts */}
        {error && <div className="mx-8 mt-6 bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start"><svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg><p className="text-sm text-red-700">{error}</p></div>}
        {notice && <div className="mx-8 mt-6 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start"><svg className="w-5 h-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg><p className="text-sm text-emerald-700">{notice}</p></div>}

        {/* Stats Row */}
        {!error && summary && <div className="px-8 py-6 bg-gray-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoCard icon="📊" label="Total Students" value={summary.total_students} />
            <InfoCard icon="✅" label="Verified" value={summary.verified_students} />
            <InfoCard icon="⏳" label="Pending" value={summary.pending_verification} />
            <InfoCard icon="📍" label="Page" value={`${meta.current_page} of ${meta.last_page}`} />
          </div>
        </div>}

        {/* Search Bar */}
        <div className="px-8 py-6">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" name="search" value={filters.search} onChange={updateFilter} placeholder="Search by student ID number or name..." className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 transition-all" />
          </div>
        </div>

        {/* Filters */}
        <div className="px-8 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FilterSelect label="Program" name="program" value={filters.program} onChange={updateFilter} options={filterOptions.programs} />
            <FilterSelect label="Department" name="department" value={filters.department} onChange={updateFilter} options={filterOptions.departments} />
            <FilterSelect label="Year Level" name="year_level" value={filters.year_level} onChange={updateFilter} options={filterOptions.year_levels} />
            <FilterSelect label="Status" name="status" value={filters.status} onChange={updateFilter} options={['verified', 'pending', 'unverified']} />
          </div>
          {hasActiveFilters && <button onClick={clearFilters} className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium">Clear all filters</button>}
        </div>

        {/* Student List */}
        <div className="px-8 pb-8">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-sm text-gray-500">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="py-20 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {students.map((student) => (
                  <StudentCard key={student.id} student={student} onView={viewStudent} onEdit={setEditing} onDelete={setDeleting} canEdit={canEdit} />
                ))}
              </div>
              {meta.last_page > 1 && <Pagination meta={meta} onPageChange={loadStudents} />}
            </>
          )}
        </div>
      </div>
    </main>

    {/* Modals */}
    {selected && <ViewModal student={selected} onClose={() => setSelected(null)} onEdit={(s) => { setEditing(s); setSelected(null) }} canEdit={canEdit} />}
    {editing && <EditModal student={editing} saving={saving} fieldErrors={fieldErrors} onSave={saveStudent} onChange={setEditing} onClose={() => setEditing(null)} />}
    {deleting && <DeleteModal student={deleting} saving={saving} onConfirm={deleteStudent} onClose={() => setDeleting(null)} />}

    {/* Role Switcher for Testing */}
    <RoleSwitcher currentUser={currentUser} />
  </div>
}

// Components
function InfoCard({ icon, label, value }) {
  return (
    <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-100">
      <div className="text-2xl">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-500">{label}</div>
        <div className="text-xl font-bold text-gray-900">{value}</div>
      </div>
    </div>
  )
}

function FilterSelect({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      <select name={name} value={value} onChange={onChange} className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 transition-all">
        <option value="">All {label}</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  )
}

function StudentCard({ student, onView, onEdit, onDelete, canEdit }) {
  return (
    <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4 flex-1">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {student.first_name[0]}{student.last_name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-gray-900">{student.full_name}</h3>
              <StatusBadge status={student.verification_status} />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
              <span className="flex items-center"><svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>{student.student_id_number}</span>
              <span className="flex items-center"><svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>{student.program}</span>
              <span>{student.year_level} • {student.section}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => window.location.href = `/students/${student.id}`} className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="View Profile">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </button>
          <button onClick={() => onView(student.id)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Quick View">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </button>
          <button disabled={!canEdit} onClick={() => onEdit(student)} className="p-2.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed" title="Edit">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button disabled={!canEdit} onClick={() => onDelete(student)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed" title="Delete">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    unverified: 'bg-gray-100 text-gray-600 border-gray-200'
  }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>{status}</span>
}

function Pagination({ meta, onPageChange }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 pt-6 border-t border-gray-100 gap-4">
      <p className="text-sm text-gray-500">Page {meta.current_page} of {meta.last_page} • {meta.total} students</p>
      <div className="flex space-x-2">
        <button disabled={meta.current_page === 1} onClick={() => onPageChange(meta.current_page - 1)} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all">← Previous</button>
        <button disabled={meta.current_page === meta.last_page} onClick={() => onPageChange(meta.current_page + 1)} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Next →</button>
      </div>
    </div>
  )
}

function ViewModal({ student, onClose, onEdit, canEdit }) {
  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-100" onClick={(e) => e.stopPropagation()}>
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl">
          <h2 className="text-xl font-bold text-gray-900">Student Details</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InfoItem label="Full Name" value={student.full_name} />
            <InfoItem label="Student ID Number" value={student.student_id_number} highlight />
            <InfoItem label="Email" value={student.email || '—'} />
            <InfoItem label="Program" value={student.program} />
            <InfoItem label="Department" value={student.department} />
            <InfoItem label="Year Level" value={student.year_level} />
            <InfoItem label="Section" value={student.section} />
            <InfoItem label="Contact" value={student.contact_number || '—'} />
            <div><div className="text-xs font-medium text-gray-500 mb-2">Status</div><StatusBadge status={student.verification_status} /></div>
          </div>
        </div>
        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-3 rounded-b-3xl">
          <button onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all">Close</button>
          <button disabled={!canEdit} onClick={() => onEdit(student)} className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Edit Student</button>
        </div>
      </div>
    </div>
  )
}

function EditModal({ student, saving, fieldErrors, onSave, onChange, onClose }) {
  const [photoPreview, setPhotoPreview] = useState(student.photo_url || null)
  
  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (file) {
      onChange(c => ({ ...c, photoFile: file }))
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-100" onClick={(e) => e.stopPropagation()}>
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl">
          <h2 className="text-xl font-bold text-gray-900">{student.id ? 'Edit Student' : 'Add New Student'}</h2>
          <button onClick={onClose} disabled={saving} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={onSave} className="p-8">
          {/* Photo Upload Section */}
          <div className="mb-6 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                {photoPreview ? (
                  <img src={photoPreview} alt="Student" className="w-24 h-24 rounded-xl object-cover border-4 border-white shadow-lg" />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-lg">
                    {student.first_name?.[0] || '?'}{student.last_name?.[0] || ''}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Photo {student.id && '(Required for ID Card)'}
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 file:cursor-pointer cursor-pointer"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Accepted formats: JPEG, PNG, WebP • Max size: 5MB
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Student ID Number" value={student.student_id_number || ''} error={fieldErrors.student_id_number} onChange={(e) => onChange(c => ({ ...c, student_id_number: e.target.value }))} placeholder="e.g., MBC2023-00562" required />
            <FormField label="First Name" value={student.first_name || ''} error={fieldErrors.first_name} onChange={(e) => onChange(c => ({ ...c, first_name: e.target.value }))} required />
            <FormField label="Middle Initial" value={student.middle_name || ''} error={fieldErrors.middle_name} onChange={(e) => onChange(c => ({ ...c, middle_name: e.target.value }))} maxLength={1} />
            <FormField label="Last Name" value={student.last_name || ''} error={fieldErrors.last_name} onChange={(e) => onChange(c => ({ ...c, last_name: e.target.value }))} required />
            <FormField label="Email" type="email" value={student.email || ''} error={fieldErrors.email} onChange={(e) => onChange(c => ({ ...c, email: e.target.value }))} />
            <FormField label="Contact Number" value={student.contact_number || ''} error={fieldErrors.contact_number} onChange={(e) => onChange(c => ({ ...c, contact_number: e.target.value }))} />
            <FormField label="Program" value={student.program || ''} error={fieldErrors.program} onChange={(e) => onChange(c => ({ ...c, program: e.target.value }))} required />
            <FormField label="Department" value={student.department || ''} error={fieldErrors.department} onChange={(e) => onChange(c => ({ ...c, department: e.target.value }))} required />
            <FormField label="Year Level" value={student.year_level || ''} error={fieldErrors.year_level} onChange={(e) => onChange(c => ({ ...c, year_level: e.target.value }))} required />
            <FormField label="Section" value={student.section || ''} error={fieldErrors.section} onChange={(e) => onChange(c => ({ ...c, section: e.target.value }))} required />
          </div>
          <div className="mt-5">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Verification Status</label>
            <select value={student.verification_status || 'pending'} onChange={(e) => onChange(c => ({ ...c, verification_status: e.target.value }))} className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 transition-all">
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
          <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button type="button" disabled={saving} onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">{saving ? 'Saving...' : student.id ? 'Save Changes' : 'Create Student'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteModal({ student, saving, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-gray-100" onClick={(e) => e.stopPropagation()}>
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Student?</h3>
          <p className="text-sm text-gray-500 mb-1">You are about to delete:</p>
          <p className="text-base font-semibold text-gray-900 mb-1">{student.full_name}</p>
          <p className="text-sm text-gray-500 font-mono mb-4">{student.student_id_number}</p>
          <p className="text-xs text-gray-400">This action cannot be undone</p>
        </div>
        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-center gap-3 rounded-b-3xl">
          <button disabled={saving} onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all">Cancel</button>
          <button disabled={saving} onClick={onConfirm} className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">{saving ? 'Deleting...' : 'Delete Student'}</button>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value, highlight }) {
  return (
    <div>
      <div className="text-xs font-medium text-gray-500 mb-2">{label}</div>
      <div className={`text-sm ${highlight ? 'font-semibold text-emerald-600' : 'text-gray-900'}`}>{value}</div>
    </div>
  )
}

function FormField({ label, type = 'text', value, error, onChange, required, maxLength, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
      <input type={type} value={value} onChange={onChange} required={required} maxLength={maxLength} placeholder={placeholder} className={`block w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-4 transition-all ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-50' : 'border-gray-200 focus:border-emerald-300 focus:ring-emerald-50'}`} />
      {error && <p className="mt-1.5 text-xs text-red-600">{error[0]}</p>}
    </div>
  )
}
