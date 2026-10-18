import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const ProductDetailsModal = ({ isOpen, onClose, product, onOrderClick }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  // Get category badge color
  const getCategoryColor = (categoryName) => {
    if (!categoryName) return 'bg-gray-100 text-gray-800';
    
    switch (categoryName.toLowerCase()) {
      case 'school supplies': return 'bg-blue-100 text-blue-800';
      case 'pe uniform': return 'bg-green-100 text-green-800';
      case 'school uniform': return 'bg-purple-100 text-purple-800';
      case 'accessories': return 'bg-orange-100 text-orange-800';
      case 'printing services': return 'bg-red-100 text-red-800';
      case 'office supplies': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if product has expired
  const isExpired = (expirationDate) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  };

  // Format expiration date
  const formatExpirationDate = (expirationDate) => {
    if (!expirationDate) return null;
    return new Date(expirationDate).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleOrderClick = () => {
    onOrderClick(product);
    onClose();
  };

  if (!isOpen || !product) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative w-full max-w-2xl bg-white rounded-xl shadow-2xl transform transition-all duration-300 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Image */}
              <div className="space-y-4">
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {product.image_url || product.product_image ? (
                    <img 
                      src={product.image_url || product.product_image} 
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2z" />
                      </svg>
                      <p className="text-sm">No Image Available</p>
                    </div>
                  )}
                  
                  {/* Expiration Warning */}
                  {product.expiration_date && isExpired(product.expiration_date) && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                      Expired
                    </div>
                  )}
                </div>

                {/* Category Badge */}
                <div className="flex justify-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(product.category_name)}`}>
                    {product.category_name || 'Uncategorized'}
                  </span>
                </div>
              </div>

              {/* Product Information */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  {product.barcode && (
                    <p className="text-sm text-gray-500">SKU: {product.barcode}</p>
                  )}
                </div>

                {/* Price Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-blue-600">{formatPrice(product.price)}</span>
                    {product.unit && (
                      <span className="text-sm text-gray-600">per {product.unit}</span>
                    )}
                  </div>
                  
                  {product.cost && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Cost: {formatPrice(product.cost)}</span>
                      <span className="text-green-600 font-medium">
                        Margin: {formatPrice(product.price - product.cost)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                  </div>
                )}

                {/* Product Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Status</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      (product.status === 'active' || product.is_active) && !isExpired(product.expiration_date)
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isExpired(product.expiration_date) ? 'Expired' :
                       (product.status === 'active' || product.is_active) ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  {product.unit && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Unit</h4>
                      <p className="text-gray-600">{product.unit}</p>
                    </div>
                  )}

                  {product.expiration_date && (
                    <div className="col-span-2">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {isExpired(product.expiration_date) ? 'Expired On' : 'Expires On'}
                      </h4>
                      <p className={`${
                        isExpired(product.expiration_date) ? 'text-red-600 font-medium' : 'text-gray-600'
                      }`}>
                        {formatExpirationDate(product.expiration_date)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Additional Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Additional Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Product ID:</span>
                      <span className="text-gray-900">{product.id || product.product_id}</span>
                    </div>
                    {product.barcode && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Barcode/SKU:</span>
                        <span className="text-gray-900 font-mono">{product.barcode}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="text-gray-900">{product.category_name || 'Uncategorized'}</span>
                    </div>
                    {product.created_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Added:</span>
                        <span className="text-gray-900">
                          {new Date(product.created_at).toLocaleDateString('en-PH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Need help? Contact the business center</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              
              <button
                onClick={handleOrderClick}
                disabled={isExpired(product.expiration_date) || (product.status !== 'active' && !product.is_active)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isExpired(product.expiration_date) || (product.status !== 'active' && !product.is_active)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0l-.4-2M16 19a2 2 0 100-4 2 2 0 000 4zm-7 0a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                {isExpired(product.expiration_date) ? 'Expired' : 
                 (product.status !== 'active' && !product.is_active) ? 'Unavailable' : 'Order Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProductDetailsModal;