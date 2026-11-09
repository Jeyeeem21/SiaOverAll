import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';

// v2.0 - Compact font sizing matching admin module
const StudentDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <>
      <Navigation userRole="student" />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-5 lg:px-6">
            <div className="flex justify-between items-center py-5">
              <div className="text-left select-none">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  Welcome, {user?.name || 'Student'}!
                </h1>
                <p className="mt-1.5 text-[11px] text-gray-400">
                  Student Account System Dashboard
                </p>
              </div>

              <div className="flex items-center space-x-4 md:hidden">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.email}</span>
                </div>
                <button
                  onClick={logout}
                  className="btn-secondary btn-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
      <main className="mt-7">
        <div className="max-w-7xl mx-auto px-5 lg:px-6 pb-8">
          {/* Success Message */}
          <div className="mb-7 bg-emerald-50 border border-emerald-200 rounded-2xl p-5 animate-fade-in">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-[13px] font-bold text-emerald-800">🎉 Login Successful!</h3>
                <p className="text-[11px] text-emerald-700">You have successfully logged in to the Student Account System.</p>
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="card mb-7 animate-slide-up">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-[15px] font-bold text-gray-900">Profile Information</h2>
            </div>
            <div className="px-5 py-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                  <p className="mt-1.5 text-[13px] text-gray-900">{user?.name || 'Test User'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                  <p className="mt-1.5 text-[13px] text-gray-900">{user?.email || 'test@example.com'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Student ID</label>
                  <p className="mt-1.5 text-[13px] text-gray-900">{user?.student_id || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">College</label>
                  <p className="mt-1.5 text-[13px] text-gray-900">{user?.college || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Department</label>
                  <p className="mt-1.5 text-[13px] text-gray-900">{user?.department || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</label>
                  <p className="mt-1.5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-300">
                      {user?.status || 'Active'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders Card */}
          <div className="card animate-slide-up">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-[15px] font-bold text-gray-900">Recent Orders</h2>
            </div>
            <div className="px-5 py-5">
              <div className="text-center py-8 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-[11px] font-medium text-gray-900 mb-1">No recent orders</p>
                <p className="text-[10px] text-gray-400">Your recent orders will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </>
  );
};

export default StudentDashboard;