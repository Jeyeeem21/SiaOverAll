import { useEffect, useState } from 'react'
import { apiRequest } from '../api/client'
import StaffIdGeneration from './staff/StaffIdGeneration'
import StaffIdStatus from './staff/StaffIdStatus'
import StaffReleaseHistory from './staff/StaffReleaseHistory'
import StaffStudentRecords from './staff/StaffStudentRecords'
import { TableSkeleton } from '../components/LoadingSkeletons'

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState('student-records')
  const [currentUser, setCurrentUser] = useState(null)
  const [isEmbedded, setIsEmbedded] = useState(false)

  // Check if we're embedded in an iframe
  useEffect(() => {
    const embedded = window.self !== window.top
    setIsEmbedded(embedded)
    
    // If embedded, request token from parent immediately
    if (embedded && window.parent) {
      console.log('Embedded in iframe, requesting token from parent...')
      window.parent.postMessage({ type: 'REQUEST_AUTH_TOKEN' }, '*')
    }
  }, [])

  // Listen for messages from parent window
  useEffect(() => {
    const handleMessage = (event) => {
      // Handle auth token
      if (event.data.type === 'AUTH_TOKEN' && event.data.token) {
        console.log('Received AUTH_TOKEN from parent', event.data.token.substring(0, 20) + '...')
        localStorage.setItem('auth_token', event.data.token)
        // Reload user data with new token - use setTimeout to ensure token is saved
        setTimeout(() => {
          apiRequest('/user')
            .then((user) => {
              console.log('User loaded successfully:', user)
              setCurrentUser(user)
            })
            .catch((err) => {
              console.error('Failed to load user:', err)
              setCurrentUser(null)
            })
        }, 100)
      }
      
      // Handle tab change from parent
      if (event.data.type === 'CHANGE_TAB' && event.data.tab) {
        setActiveTab(event.data.tab)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Notify parent of tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (isEmbedded && window.parent) {
      window.parent.postMessage({ type: 'TAB_CHANGE', tab }, '*')
    }
  }

  useEffect(() => {
    // Only fetch user if:
    // 1. We're NOT embedded (standalone mode) AND have a token
    // 2. OR we're embedded but already received token from parent
    const token = localStorage.getItem('auth_token')
    
    if (!token) {
      if (!isEmbedded) {
        // Standalone mode without token - redirect to login
        console.log('No auth token found in standalone mode')
      } else {
        // Embedded mode - waiting for token from parent
        console.log('Embedded mode: No auth token yet, waiting for parent...')
      }
      return
    }
    
    let active = true
    console.log('Fetching user with token:', token.substring(0, 20) + '...')
    apiRequest('/user')
      .then((user) => { 
        if (active) {
          console.log('User loaded:', user)
          setCurrentUser(user)
        }
      })
      .catch((err) => { 
        if (active) {
          console.error('Failed to load user:', err)
          setCurrentUser(null)
        }
      })
    return () => { active = false }
  }, [isEmbedded])

  const isStaff = ['Admin', 'Staff'].includes(currentUser?.role)

  // Removed access control - staff page is the only page now

  return (
    <div className="staff-dashboard flex flex-col">
      {/* Top Navigation Bar - Hidden when embedded in iframe */}
      {!isEmbedded && (
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
          </div>
        </nav>
      )}

      {/* Tabs - Hidden when embedded (parent has tabs now) */}
      {!isEmbedded && (
        <div>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="staff-tabs">
              <button
                onClick={() => handleTabChange('student-records')}
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
                onClick={() => handleTabChange('id-management')}
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
                onClick={() => handleTabChange('id-status')}
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
                onClick={() => handleTabChange('release-history')}
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
      )}

      {/* Main Content - Flex grow to fill space */}
      {/* Only render tabs if user is authenticated */}
      <main className="staff-main flex-1">
        <div className="h-full">
          {!currentUser ? (
            <DashboardSkeleton />
          ) : (
            <>
              {activeTab === 'student-records' && <StaffStudentRecords />}
              {activeTab === 'id-management' && <StaffIdGeneration />}
              {activeTab === 'id-status' && <StaffIdStatus />}
              {activeTab === 'release-history' && <StaffReleaseHistory />}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="workflow-page" aria-busy="true" aria-label="Loading ID Management">
      <div className="workflow-surface bg-white">
        <div className="workflow-header animate-pulse space-y-2">
          <div className="h-7 w-48 rounded bg-gray-200" />
          <div className="h-3 w-80 max-w-full rounded bg-gray-200" />
        </div>
        <div className="workflow-toolbar animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((index) => (
              <div key={index} className="h-24 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <div className="h-3 w-20 rounded bg-gray-200" />
                <div className="mt-3 h-6 w-12 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
        <div className="workflow-content pt-0">
          <TableSkeleton columns={8} rows={5} />
        </div>
      </div>
    </div>
  )
}
