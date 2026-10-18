import { useState } from 'react';
import Navigation from '../components/Navigation';
import { OrdersSkeleton } from '../components/SkeletonLoader';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../hooks/useOrders';
import OrderDetailsModal from '../components/modals/OrderDetailsModal';

const DevOrders = () => {
  const { isAuthenticated } = useAuth();
  const { orders, loading, error, orderStats, refreshOrders } = useOrders();

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsInitialMode, setDetailsInitialMode] = useState('view');

  const openModal = (order, mode = 'view') => {
    setSelectedOrder(order);
    setDetailsInitialMode(mode);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
    setDetailsInitialMode('view');
  };

  const handleOrderUpdated = () => refreshOrders();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    });
  };

  const formatPrice = (amount) => `₱${parseFloat(amount || 0).toFixed(2)}`;

  // ── Not authenticated ──────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-md p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h3>
            <p className="text-gray-600 mb-6">Please log in to view your orders.</p>
            <a href="/dev/login" className="w-full block px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              Login to Continue
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Navigation userRole="student" />
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
          <main className="pt-6 sm:pt-8 main-content">
            <div className="container-responsive space-responsive">
              <OrdersSkeleton />
            </div>
          </main>
        </div>
      </>
    );
  }

  // ── Error ──────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-md p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Orders</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button onClick={refreshOrders} className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main ───────────────────────────────────────────────────
  return (
    <>
      <Navigation userRole="student" />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <main className="pt-6 sm:pt-8 main-content">
          <div className="container-responsive space-responsive">

            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-responsive-2xl font-bold text-gray-900">My Orders</h1>
              <p className="mt-2 text-responsive-sm text-gray-600">Track your document requests</p>
            </div>

            {/* New Order */}
            <div className="mb-6">
              <a href="/dev/products" className="btn-primary btn-md sm:btn-lg w-full sm:w-auto inline-flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Order
              </a>
            </div>

            {/* Stats */}
            <div className="grid-responsive-4 gap-responsive">
              {[
                { value: orderStats.total,     label: 'Total Orders',  color: 'text-orange-600' },
                { value: orderStats.processing, label: 'Processing',    color: 'text-blue-600'   },
                { value: orderStats.completed,  label: 'Completed',     color: 'text-green-600'  },
                { value: formatPrice(orderStats.totalSpent), label: 'Total Spent', color: 'text-gray-600' },
              ].map((stat, i) => (
                <div key={i} className="card card-sm animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="text-center">
                    <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-responsive-xs text-gray-600">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Orders list */}
            <div className="card animate-slide-up">
              <div className="header-responsive border-b border-gray-200">
                <h2 className="text-responsive-xl font-semibold text-gray-900">Order History</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
                    <a href="/dev/products" className="inline-flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                      Browse Products
                    </a>
                  </div>
                ) : (
                  orders.map((order) => {
                    const statusColors = {
                      completed:  { bg: 'bg-green-100',  text: 'text-green-600',  badge: 'bg-green-100 text-green-800'  },
                      processing: { bg: 'bg-blue-100',   text: 'text-blue-600',   badge: 'bg-blue-100 text-blue-800'    },
                      pending:    { bg: 'bg-yellow-100', text: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-800' },
                    };
                    const sc = statusColors[order.status] || { bg: 'bg-red-100', text: 'text-red-600', badge: 'bg-red-100 text-red-800' };

                    return (
                  <div
                    key={order.id}
                    className="p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => openModal(order, 'view')}
                  >
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      {/* Icon */}
                      <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${sc.bg}`}>
                        <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${sc.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* Order info */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-responsive-sm font-semibold text-gray-900">{order.order_number}</h3>
                            <p className="text-responsive-sm text-gray-700 truncate">{order.item}</p>
                            <p className="text-responsive-sm font-medium text-gray-900">{formatPrice(order.total_amount)}</p>
                            <p className="text-responsive-xs text-gray-500">Ordered on {formatDate(order.created_at)}</p>
                            <p className="text-responsive-xs text-gray-500">Qty: {order.total_quantity}</p>
                          </div>
                          <span className={`self-start px-2.5 py-1 text-xs font-medium rounded-full shrink-0 ${sc.badge}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>

                        {/* Extra info */}
                        <div className="mt-1 space-y-0.5">
                          {order.expected_completion && !['completed','cancelled'].includes(order.status) && (
                            <p className="text-responsive-xs text-blue-600">Expected: {formatDate(order.expected_completion)}</p>
                          )}
                          {order.completed_at && (
                            <p className="text-responsive-xs text-green-600">Completed on {formatDate(order.completed_at)}</p>
                          )}
                          {order.cancelled_reason && (
                            <p className="text-responsive-xs text-red-600">Reason: {order.cancelled_reason}</p>
                          )}
                          {order.notes && (
                            <p className="text-responsive-xs text-gray-500">Notes: {order.notes}</p>
                          )}
                        </div>

                        {/* Actions — stop propagation so row click doesn't fire */}
                        <div className="flex flex-wrap gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => openModal(order, 'view')} className="btn-secondary btn-sm">
                            View Details
                          </button>
                          {order.status === 'pending' && (
                            <button onClick={() => openModal(order, 'edit')} className="btn-secondary btn-sm">
                              Update
                            </button>
                          )}
                          {['pending', 'processing'].includes(order.status) && (
                            <button onClick={() => openModal(order, 'cancel')} className="btn-danger btn-sm">
                              Cancel
                            </button>
                          )}
                          {order.status === 'completed' && (
                            <button className="btn-primary btn-sm">Download</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                    );
                  })
                )}
              </div>

              <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200">
                <a href="/dev/products" className="w-full btn-primary btn-md sm:btn-lg inline-flex items-center justify-center">
                  Order New Products
                </a>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Single modal — handles view / edit / cancel */}
      {showDetailsModal && selectedOrder && (
        <OrderDetailsModal
          isOpen={showDetailsModal}
          onClose={closeModal}
          order={selectedOrder}
          onOrderUpdated={handleOrderUpdated}
          initialMode={detailsInitialMode}
        />
      )}
    </>
  );
};

export default DevOrders;
