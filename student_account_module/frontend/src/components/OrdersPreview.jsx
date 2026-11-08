import { useState, useEffect } from 'react';
import OrderService from '../services/OrderService';

const OrdersPreview = ({ isVisible, onMouseEnter, onMouseLeave, onTouchStart }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (isVisible) {
      fetchOrdersPreview();
    }
  }, [isVisible]);

  const fetchOrdersPreview = async () => {
    try {
      setLoading(true);
      const [ordersData, statsData] = await Promise.all([
        OrderService.getMyOrders(),
        OrderService.getOrderStats()
      ]);
      
      // Get only the 3 most recent orders
      const recentOrders = ordersData
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3);
      
      setOrders(recentOrders);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch orders preview:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'text-yellow-600 bg-yellow-50',
      processing: 'text-blue-600 bg-blue-50',
      completed: 'text-green-600 bg-green-50',
      cancelled: 'text-red-600 bg-red-50'
    };
    return statusColors[status] || 'text-gray-600 bg-gray-50';
  };

  if (!isVisible) return null;

  return (
    <div 
      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Arrow pointing up */}
      <div className="flex justify-center mb-1">
        <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-white drop-shadow-sm"></div>
      </div>
      
      {/* Preview Card */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-80 overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Recent Orders
            </h3>
            {stats && (
              <span className="text-xs text-gray-500">
                {stats.total} total
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-center">
            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-sm text-gray-500">No orders yet</p>
            <p className="text-xs text-gray-400">Start shopping to see your orders here</p>
          </div>
        ) : (
          <>
            {/* Orders List */}
            <div className="max-h-64 overflow-y-auto">
              {orders.map((order, index) => (
                <div 
                  key={order.id} 
                  className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-25 transition-colors duration-150 animate-fadeInUp`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {order.item || order.document_type || `Order #${order.order_number}`}
                      </p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          Qty: {order.quantity || 1}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right ml-3">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatPrice(order.total_amount)}
                      </p>
                      {order.payment_status === 'unpaid' && (
                        <span className="text-xs text-red-600 font-medium">Unpaid</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer with quick stats */}
            {stats && (
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex space-x-4">
                    <span className="text-gray-600">
                      <span className="font-medium text-yellow-600">{stats.pending}</span> Pending
                    </span>
                    <span className="text-gray-600">
                      <span className="font-medium text-green-600">{stats.completed}</span> Completed
                    </span>
                  </div>
                  <span className="text-blue-600 font-medium hover:underline cursor-pointer">
                    View All →
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersPreview;