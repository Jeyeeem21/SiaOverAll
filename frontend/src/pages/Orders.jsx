import Navigation from '../components/Navigation';
import { useStudentOrders } from '../hooks/useStudentData';

const Orders = () => {
  const { orders, loading, error } = useStudentOrders();

  return (
    <>
      <Navigation userRole="student" />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
        
        <header className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="mt-1 text-sm text-gray-600">
                Track your document requests and orders
              </p>
            </div>
          </div>
        </header>

        <main className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Request Transcript</p>
                  <p className="text-sm text-gray-500">Official academic records</p>
                </div>
              </div>
            </button>

            <button className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Certificate</p>
                  <p className="text-sm text-gray-500">Enrollment certificate</p>
                </div>
              </div>
            </button>

            <button className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-5H8z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Other Documents</p>
                  <p className="text-sm text-gray-500">Request other documents</p>
                </div>
              </div>
            </button>
          </div>

          {/* Orders List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="px-6 py-4 text-center text-gray-500">Loading orders...</div>
              ) : orders && orders.length > 0 ? (
                orders.map((order, index) => (
                  <div key={index} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">{order.item}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span>Order #{order.order_number}</span>
                          <span className="mx-2">•</span>
                          <span>₱{order.amount}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        {order.expected_completion && (
                          <p className="mt-1 text-xs text-gray-400">
                            Expected: {order.expected_completion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">No orders yet.</p>
                  <p className="text-xs text-gray-400">Request your first document to get started.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Orders;