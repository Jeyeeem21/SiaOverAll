import { useEffect, useState } from 'react'
import { apiRequest } from '../api/client'
import StaffIdGeneration from './staff/StaffIdGeneration'
import StaffIdStatus from './staff/StaffIdStatus'
import StaffReleaseHistory from './staff/StaffReleaseHistory'
import StaffStudentRecords from './staff/StaffStudentRecords'

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState('student-records')
  const [currentUser, setCurrentUser] = useState(null)

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

  const isStaff = ['Admin', 'Staff'].includes(currentUser?.role)

  // Removed access control - staff page is the only page now

  return (
    <div className="staff-dashboard flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="staff-nav sticky top-0 z-50">
        <div className="staff-nav-container">
          <div className="staff-topbar flex items-center justify-between">
            <div className="staff-brand">
              <div className="staff-brand-icon">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="leading-tight">
                <h1 className="text-xl font-bold text-gray-800">MinSU ID System</h1>
                <p className="mt-1 text-xs font-medium text-gray-500">Staff Portal</p>
              </div>
            </div>

            <div className="staff-user">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-gray-900">{currentUser?.full_name || 'Staff User'}</div>
                <div className="text-xs text-emerald-600 font-medium">{currentUser?.role || 'Staff'}</div>
              </div>
              <div className="staff-avatar">
                {currentUser?.full_name?.[0] || 'S'}
              </div>
            </div>
          </div>

          {/* Tabs - Modern Pill Style */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="staff-tabs">
              <button
                onClick={() => setActiveTab('student-records')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'student-records'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Student Records
                </span>
              </button>
              <button
                onClick={() => setActiveTab('id-management')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'id-management'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  ID Production
                </span>
              </button>
              <button
                onClick={() => setActiveTab('id-status')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'id-status'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  ID Status
                </span>
              </button>
              <button
                onClick={() => setActiveTab('release-history')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'release-history'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Release History
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Flex grow to fill space */}
      <main className="staff-main flex-1">
        <div className="h-full">
          {activeTab === 'student-records' && <StaffStudentRecords />}
          {activeTab === 'id-management' && <StaffIdGeneration />}
          {activeTab === 'id-status' && <StaffIdStatus />}
          {activeTab === 'release-history' && <StaffReleaseHistory />}
        </div>
      </main>
    </div>
  )
}
