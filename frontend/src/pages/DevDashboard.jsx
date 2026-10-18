import Navigation from '../components/Navigation';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import { useStudentProfile, useStudentStats, useStudentDocuments, useStudentOrders } from '../hooks/useStudentData';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DevDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { profile, loading: profileLoading, error: profileError } = useStudentProfile();
  const { stats, loading: statsLoading, error: statsError } = useStudentStats();
  const { documents, loading: docsLoading } = useStudentDocuments();
  const { orders, loading: ordersLoading } = useStudentOrders();

  const handleLogout = () => {
    logout();
    navigate('/dev/login');
  };

  // Show skeleton while any critical data is loading
  const isLoading = profileLoading || statsLoading;

  if (isLoading) {
    return (
      <>
        <Navigation userRole="student" />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
          <main className="pt-6 sm:pt-8 main-content">
            <div className="container-responsive space-responsive">
              <DashboardSkeleton />
            </div>
          </main>
        </div>
      </>
    );
  }

  // Use real data if available, fallback to mock data
  const displayUser = profile || user || {
    name: 'Juan Cruz',
    email: 'juan.cruz@student.edu.ph',
    role: 'student',
    id: 'STU-2024-0001'
  };

  const displayStats = stats || {
    documents_count: 0,
    student_status: 'pending',
    orders_count: 0,
    notifications_count: 0,
    total_spent: 0,
    pending_payments: 0,
    account_completion: 70
  };

  return (
    <>
      <Navigation userRole="student" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <main className="pt-6 sm:pt-8 main-content">
          <div className="container-responsive space-responsive">
            {/* Welcome Section */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-responsive-2xl font-bold text-gray-900">
                Welcome, {displayUser.name}!
              </h1>
              <p className="mt-2 text-responsive-sm text-gray-600">
                Student Account System Dashboard
              </p>
            </div>
          {/* Stats Cards */}
          <div className="grid-responsive-4 gap-responsive">
            <div className="card card-md animate-slide-up">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-full bg-blue-100">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-responsive-xs font-medium text-gray-600">Account Status</p>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-900 capitalize">
                    {displayStats.student_status || 'Pending'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {displayStats.account_completion}% Complete
                  </p>
                </div>
              </div>
            </div>

            <div className="card card-md animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-full bg-green-100">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-responsive-xs font-medium text-gray-600">Documents</p>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                    {displayStats.documents_count}
                  </p>
                  <p className="text-xs text-gray-500">
                    Uploaded
                  </p>
                </div>
              </div>
            </div>

            <div className="card card-md animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-full bg-purple-100">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-responsive-xs font-medium text-gray-600">Orders</p>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                    {displayStats.orders_count}
                  </p>
                  <p className="text-xs text-gray-500">
                    ₱{displayStats.total_spent?.toFixed(2) || '0.00'} spent
                  </p>
                </div>
              </div>
            </div>

            <div className="card card-md animate-slide-up" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-full bg-yellow-100">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM8.515 2h11.5A2.015 2.015 0 0122 4.015v15.97A2.015 2.015 0 0119.985 22H8.515A2.015 2.015 0 016.5 19.985V4.015A2.015 2.015 0 018.515 2z" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-responsive-xs font-medium text-gray-600">Notifications</p>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                    {displayStats.notifications_count}
                  </p>
                  <p className="text-xs text-gray-500">
                    {displayStats.pending_payments > 0 ? `₱${displayStats.pending_payments.toFixed(2)} pending` : 'All paid'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="card animate-slide-up" style={{animationDelay: '0.4s'}}>
            <div className="header-responsive border-b border-gray-200">
              <h2 className="text-responsive-xl font-semibold text-gray-900">Profile Information</h2>
            </div>
            <div className="card-md">
              <div className="grid-responsive-3 gap-responsive">
                <div>
                  <label className="text-responsive-xs font-medium text-gray-500">Full Name</label>
                  <p className="mt-1 text-responsive-sm text-gray-900">{profile?.name || displayUser.name}</p>
                </div>
                <div>
                  <label className="text-responsive-xs font-medium text-gray-500">Email Address</label>
                  <p className="mt-1 text-responsive-sm text-gray-900 truncate">{profile?.email || displayUser.email}</p>
                </div>
                <div>
                  <label className="text-responsive-xs font-medium text-gray-500">Student ID</label>
                  <p className="mt-1 text-responsive-sm text-gray-900">{profile?.student_number || displayUser.student_number || displayUser.id}</p>
                </div>
                <div>
                  <label className="text-responsive-xs font-medium text-gray-500">College</label>
                  <p className="mt-1 text-responsive-sm text-gray-900">{profile?.college || 'College of Computer Studies'}</p>
                </div>
                <div>
                  <label className="text-responsive-xs font-medium text-gray-500">Department</label>
                  <p className="mt-1 text-responsive-sm text-gray-900">{profile?.department || 'Information Technology'}</p>
                </div>
                <div>
                  <label className="text-responsive-xs font-medium text-gray-500">Status</label>
                  <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    displayStats.student_status === 'approved' ? 'bg-green-100 text-green-800' :
                    displayStats.student_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {displayStats.student_status || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-responsive-lg">
            {/* Documents Section */}
            <div className="card animate-slide-up" style={{animationDelay: '0.5s'}}>
              <div className="header-responsive border-b border-gray-200">
                <h2 className="text-responsive-xl font-semibold text-gray-900">Recent Documents</h2>
              </div>
              <div className="card-md">
                <div className="space-responsive">
                  {docsLoading ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Loading documents...</p>
                    </div>
                  ) : documents && documents.length > 0 ? (
                    documents.slice(0, 3).map((doc, index) => (
                      <div key={doc.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 text-responsive-sm truncate">{doc.original_name}</p>
                            <p className="text-responsive-xs text-gray-500">{doc.document_type} • {new Date(doc.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ml-2 ${
                          doc.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">No documents uploaded yet</p>
                      <p className="text-xs text-gray-400">Upload your verification documents to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Orders Section */}
            <div className="card animate-slide-up" style={{animationDelay: '0.6s'}}>
              <div className="header-responsive border-b border-gray-200">
                <h2 className="text-responsive-xl font-semibold text-gray-900">Recent Orders</h2>
              </div>
              <div className="card-md">
                <div className="space-responsive">
                  {ordersLoading ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Loading orders...</p>
                    </div>
                  ) : orders && orders.length > 0 ? (
                    orders.slice(0, 3).map((order, index) => (
                      <div key={order.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-responsive-sm">{order.order_number}</p>
                          <p className="text-responsive-xs text-gray-600 truncate">{order.item}</p>
                          <p className="text-responsive-xs text-gray-500">
                            ₱{parseFloat(order.total_amount || 0).toFixed(2)} • {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ml-2 ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' 
                          : order.status === 'processing' ? 'bg-blue-100 text-blue-800'
                          : order.status === 'ready' ? 'bg-purple-100 text-purple-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">No orders yet</p>
                      <p className="text-xs text-gray-400">Order your first document to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </>
  );
};

export default DevDashboard;