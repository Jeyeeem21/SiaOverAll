import { useState } from 'react';

const OrderConfirmationModal = ({ isOpen, onClose, order }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen || !order) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      normal: 'bg-gray-100 text-gray-800',
      high: 'bg-yellow-100 text-yellow-800',
      urgent: 'bg-red-100 text-red-800'
    };
    
    return colors[priority] || colors.normal;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal content */}
        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          {/* Success Icon */}
          <div className="px-6 pt-6 pb-4 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Order Created Successfully!
              </h3>
              <p className="text-sm text-gray-600">
                Your order has been submitted and will be processed soon.
              </p>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">Order Summary</h4>
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  {order.order_number || order.order?.order_number}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Item:</span>
                  <span className="text-gray-900 font-medium">
                    {order.item || order.order?.item}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="text-gray-900">
                    {order.quantity || order.order?.quantity}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Unit Price:</span>
                  <span className="text-gray-900">
                    {formatPrice(order.unit_price || order.order?.unit_price)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Priority:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPriorityBadge(order.priority || order.order?.priority)}`}>
                    {(order.priority || order.order?.priority || 'normal').charAt(0).toUpperCase() + (order.priority || order.order?.priority || 'normal').slice(1)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Pickup Method:</span>
                  <span className="text-gray-900">
                    {(order.pickup_method || order.order?.pickup_method || 'pickup').charAt(0).toUpperCase() + 
                     (order.pickup_method || order.order?.pickup_method || 'pickup').slice(1)}
                  </span>
                </div>

                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-900">Total Amount:</span>
                    <span className="text-gray-900">
                      {formatPrice(order.amount || order.order?.amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details (Collapsible) */}
            {(order.notes || order.order?.notes) && (
              <div className="mb-4">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <span>Order Notes</span>
                  <svg 
                    className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showDetails && (
                  <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-600">
                    {order.notes || order.order?.notes}
                  </div>
                )}
              </div>
            )}

            {/* Status Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">
                    What happens next?
                  </h4>
                  <div className="mt-1 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Your order is now being processed</li>
                      <li>You'll be notified when it's ready</li>
                      <li>Payment will be collected upon pickup</li>
                      <li>Check your orders page for updates</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => {
                  onClose();
                  // Navigate to orders page (you can implement this with your routing)
                  window.location.href = '/dev/orders';
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                View Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationModal;