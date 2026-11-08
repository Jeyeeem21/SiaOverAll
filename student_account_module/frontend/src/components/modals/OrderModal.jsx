import { useState, useEffect } from 'react';
import { useOrders } from '../../hooks/useOrders';

const OrderModal = ({ isOpen, onClose, product, onOrderCreated }) => {
  const [formData, setFormData] = useState({
    quantity: 1,
    priority: 'normal',
    pickup_method: 'pickup',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { createOrder, calculateOrderTotals } = useOrders();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        quantity: 1,
        priority: 'normal',
        pickup_method: 'pickup',
        notes: ''
      });
      setErrors({});
    }
  }, [isOpen, product]);

  // Calculate totals
  const totals = product ? calculateOrderTotals(
    parseFloat(product.price), 
    formData.quantity
  ) : null;

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle quantity change
  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(1, Math.min(100, formData.quantity + change));
    setFormData(prev => ({
      ...prev,
      quantity: newQuantity
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    if (formData.quantity > 100) {
      newErrors.quantity = 'Quantity cannot exceed 100';
    }

    if (formData.notes && formData.notes.length > 1000) {
      newErrors.notes = 'Notes cannot exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        product_id: product.id,
        quantity: formData.quantity,
        notes: formData.notes || null,
      };

      const response = await createOrder(orderData);

      // Server returns { orders: [...] } — normalize to single order
      const createdOrder = response.orders?.[0] || response.order || response;

      if (onOrderCreated) {
        onOrderCreated({ ...response, order: createdOrder, order_number: createdOrder.order_number });
      }

      onClose();
    } catch (error) {
      setErrors({
        submit: error.message || 'Failed to create order',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal content */}
        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Order Product</h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Product info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                {product.image_url || product.product_image ? (
                  <img 
                    src={product.image_url || product.product_image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                {product.description && (
                  <p className="mt-1 text-sm text-gray-600">{product.description}</p>
                )}
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-lg font-bold text-blue-600">
                    ₱{parseFloat(product.price).toFixed(2)}
                  </span>
                  {product.unit && (
                    <span className="text-sm text-gray-500">per {product.unit}</span>
                  )}
                </div>
                {product.barcode && (
                  <p className="mt-1 text-xs text-gray-500">SKU: {product.barcode}</p>
                )}
              </div>
            </div>
          </div>

          {/* Order form */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            {/* Quantity */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={formData.quantity <= 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  className="w-20 px-3 py-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={formData.quantity >= 100}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
              )}
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any special instructions or notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <div className="flex justify-between mt-1">
                <div>
                  {errors.notes && (
                    <p className="text-sm text-red-600">{errors.notes}</p>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {formData.notes.length}/1000
                </p>
              </div>
            </div>

            {/* Order Summary */}
            {totals && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Order Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Unit Price:</span>
                    <span>₱{totals.unitPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span>{totals.quantity}</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-900 pt-1 border-t">
                    <span>Total:</span>
                    <span>₱{totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Order...
                  </div>
                ) : (
                  'Create Order'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;