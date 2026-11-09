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
    navigate('/login');
  };

  // Show skeleton while any critical data is loading
  const isLoading = profileLoading || statsLoading;

  if (isLoading) {
    return (
      <>
        <Navigation userRole="student" />
        <div className="min-h-screen bg-gray-50">
          <main className="mt-7 max-w-7xl mx-auto px-5 lg:px-6 pb-20">
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
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-5 lg:px-6 py-5">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Welcome, {user?.name || 'Student'}!</h1>
            <p className="text-[11px] text-gray-400 mt-1.5">Student Account System Dashboard</p>
          </div>
        </header>
        
        <main className="mt-7 max-w-7xl mx-auto px-5 lg:px-6 pb-20">
          <div className="space-y-7">
          {/* Profile Card */}
          <div className="card animate-slide-up">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-[15px] font-bold text-gray-900">Profile Information</h2>
            </div>
            <div className="px-5 py-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                  <p className="mt-1.5 text-[13px] text-gray-900">{profile?.name || displayUser.name}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                  <p className="mt-1.5 text-[13px] text-gray-900 truncate">{profile?.email || displayUser.email}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Student ID</label>
                  <p className="mt-1.5 text-[13px] text-gray-900">{profile?.student_number || displayUser.student_number || displayUser.id}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">College</label>
                  <p className="mt-1.5 text-[13px] text-gray-900">{profile?.college || 'College of Computer Studies'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Department</label>
                  <p className="mt-1.5 text-[13px] text-gray-900">{profile?.department || 'Information Technology'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</label>
                  <span className={`mt-1.5 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    displayStats.student_status === 'approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                    displayStats.student_status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                    'bg-gray-100 text-gray-700 border border-gray-300'
                  }`}>
                    {displayStats.student_status || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">

            {/* Orders Section */}
            <div className="card animate-slide-up" style={{animationDelay: '0.6s'}}>
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-[15px] font-bold text-gray-900">Recent Orders</h2>
              </div>
              <div className="px-5 py-5">
                <div className="space-y-3">
                  {ordersLoading ? (
                    <div className="text-center py-4">
                      <p className="text-[11px] text-gray-500">Loading orders...</p>
                    </div>
                  ) : orders && orders.length > 0 ? (
                    orders.slice(0, 3).map((order, index) => (
                      <div key={order.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[13px] text-gray-900">{order.order_number}</p>
                          <p className="text-[11px] text-gray-600 truncate">{order.item}</p>
                          <p className="text-[10px] text-gray-500">
                            ₱{parseFloat(order.total_amount || 0).toFixed(2)} • {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full flex-shrink-0 ml-2 ${
                          order.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                          : order.status === 'processing' ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : order.status === 'ready' ? 'bg-purple-100 text-purple-700 border border-purple-300'
                          : 'bg-amber-100 text-amber-700 border border-amber-300'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <p className="mt-2 text-[11px] font-medium text-gray-900">No orders yet</p>
                      <p className="text-[10px] text-gray-400">Order your first document to get started</p>
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
