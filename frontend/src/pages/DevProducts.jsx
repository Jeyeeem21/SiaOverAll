import Navigation from '../components/Navigation';
import { ProductsSkeleton } from '../components/SkeletonLoader';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import ApiService from '../services/api';
import { OrderModal, OrderConfirmationModal } from '../components/modals';
import { useOrders } from '../hooks/useOrders';
import ProductDetailsModal from '../components/ProductDetailsModal';

const DevProducts = () => {
  const { user, isAuthenticated } = useAuth();
  const { orderStats, hasPendingOrders } = useOrders();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // Order modal states
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);   // for details modal
  const [orderProduct, setOrderProduct] = useState(null);         // for order modal
  const [createdOrder, setCreatedOrder] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  // Show login prompt if not authenticated
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
            <p className="text-gray-600 mb-6">
              Please log in to view and order products from the school business center.
            </p>
            <div className="space-y-3">
              <a
                href="/login"
                className="w-full block px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login to Continue
              </a>
              <a
                href="/register"
                className="w-full block px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Create Account
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesData = await ApiService.getProductCategories();
        setCategories(categoriesData);
        
        // Fetch products
        const params = {
          page: currentPage,
          limit: 12
        };
        
        if (selectedCategory) {
          params.category = selectedCategory;
        }
        
        if (searchTerm) {
          params.search = searchTerm;
        }
        
        const productsData = await ApiService.getProducts(params);
        setProducts(productsData.products || []);
        setPagination(productsData.pagination || {});
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, selectedCategory, searchTerm]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle category filter
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    return new Date(expirationDate).toLocaleDateString('en-PH');
  };

  // Handle order button click — sets orderProduct separately from selectedProduct
  const handleOrderClick = (product) => {
    if (isExpired(product.expiration_date)) {
      alert('This product has expired and cannot be ordered.');
      return;
    }
    if (product.status !== 'active' && !product.is_active) {
      alert('This product is currently unavailable for ordering.');
      return;
    }
    setShowDetailsModal(false);   // close details if open
    setSelectedProduct(null);
    setOrderProduct(product);     // set dedicated order product
    setShowOrderModal(true);
  };

  // Handle successful order creation
  const handleOrderCreated = (orderResponse) => {
    // Server returns { orders: [...], total_orders: n }
    const order = orderResponse.orders?.[0] || orderResponse.order || orderResponse;
    setCreatedOrder(order);
    setShowOrderModal(false);
    setShowConfirmationModal(true);

    setNotification({
      show: true,
      type: 'success',
      message: `Order ${order?.order_number || 'created'} successfully!`,
    });

    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    setOrderProduct(null);
  };

  const handleCloseConfirmationModal = () => {
    setShowConfirmationModal(false);
    setCreatedOrder(null);
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <>
        <Navigation userRole="student" />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
          <main className="pt-6 sm:pt-8 main-content">
            <div className="container-responsive space-responsive">
              <ProductsSkeleton />
            </div>
          </main>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation userRole="student" />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-lg font-medium mb-2">Error Loading Products</div>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation userRole="student" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <main className="pt-6 sm:pt-8 main-content">
          <div className="container-responsive space-responsive">
            
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h1 className="text-responsive-2xl font-bold text-gray-900 mb-2">Business Center Products</h1>
              <p className="text-responsive-sm text-gray-600">School supplies, uniforms, and accessories</p>
              
              {/* Order Stats */}
              {orderStats.total > 0 && (
                <div className="mt-4 flex justify-center">
                  <div className="inline-flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="text-gray-600">{orderStats.total} orders</span>
                    </div>
                    {hasPendingOrders() && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-yellow-700">{orderStats.pending + orderStats.processing} pending</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Search and Filters */}
            <div className="card card-lg mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-responsive-lg font-semibold text-gray-900">Find Products</h2>
                {orderStats.total > 0 && (
                  <a
                    href="/dev/orders"
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    View My Orders ({orderStats.total})
                  </a>
                )}
              </div>
              
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input w-full"
                  />
                </div>
                <button type="submit" className="btn-primary btn-md px-6">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </button>
              </form>
            </div>

            {/* Categories */}
            <div className="card card-lg mb-6">
              <h2 className="text-responsive-lg font-semibold text-gray-900 mb-4">Categories</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === '' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Products
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id.toString())}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id.toString()
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name} ({category.product_count})
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden group">
                  {/* Product Image */}
                  <div className="w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden cursor-pointer" onClick={() => handleViewDetails(product)}>
                    {product.image_url || product.product_image ? (
                      <img 
                        src={product.image_url || product.product_image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-gray-400 text-center">
                        <svg className="w-12 h-12 mx-auto mb-2 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2z" />
                        </svg>
                        <p className="text-xs font-medium text-gray-500">No Image Available</p>
                      </div>
                    )}
                    
                    {/* Status Badges */}
                    <div className="absolute top-3 left-3 flex flex-col space-y-1">
                      {product.expiration_date && isExpired(product.expiration_date) && (
                        <span className="bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                          Expired
                        </span>
                      )}
                      {(product.status !== 'active' && !product.is_active) && !isExpired(product.expiration_date) && (
                        <span className="bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                          Unavailable
                        </span>
                      )}
                    </div>

                    {/* Quick View Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                      <div className="bg-white/95 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full text-sm font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Click for details
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer leading-snug" onClick={() => handleViewDetails(product)}>
                        {product.name}
                      </h3>
                      
                      {/* Barcode */}
                      {product.barcode && (
                        <p className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded inline-block">
                          {product.barcode}
                        </p>
                      )}
                    </div>
                    
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
                    )}
                    
                    {/* Price and Cost */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-xl font-bold text-blue-700">{formatPrice(product.price)}</span>
                        {product.unit && (
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full font-medium">
                            per {product.unit}
                          </span>
                        )}
                      </div>
                      
                      {/* Show cost for reference (optional) */}
                      {product.cost && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Cost: {formatPrice(product.cost)}</span>
                          <span className="text-green-700 font-semibold bg-green-100 px-2 py-0.5 rounded-full">
                            +{formatPrice(product.price - product.cost)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Expiration Date */}
                    {product.expiration_date && (
                      <div className={`mb-4 p-3 rounded-lg ${
                        isExpired(product.expiration_date) 
                          ? 'bg-red-50 border border-red-200' 
                          : 'bg-amber-50 border border-amber-200'
                      }`}>
                        <div className="flex items-center">
                          <svg className={`w-4 h-4 mr-2 ${
                            isExpired(product.expiration_date) ? 'text-red-500' : 'text-amber-500'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className={`text-sm font-medium ${
                            isExpired(product.expiration_date) 
                              ? 'text-red-700' 
                              : 'text-amber-700'
                          }`}>
                            {isExpired(product.expiration_date) ? 'Expired: ' : 'Expires: '}
                            {formatExpirationDate(product.expiration_date)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="flex items-center justify-center mb-4">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getCategoryColor(product.category_name)}`}>
                        {product.category_name || 'Uncategorized'}
                      </span>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-3" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleViewDetails(product)}
                        className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 group/btn"
                      >
                        <svg className="w-4 h-4 mr-2 group-hover/btn:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="group-hover/btn:text-blue-600 transition-colors">View Details</span>
                      </button>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOrderClick(product);
                        }}
                        className={`w-full inline-flex items-center justify-center px-4 py-3 text-sm font-semibold rounded-lg shadow-sm transition-all duration-200 ${
                          isExpired(product.expiration_date) || (product.status !== 'active' && !product.is_active)
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transform hover:-translate-y-0.5 hover:shadow-md'
                        }`}
                        disabled={isExpired(product.expiration_date) || (product.status !== 'active' && !product.is_active)}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0l-.4-2M16 19a2 2 0 100-4 2 2 0 000 4zm-7 0a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                        {isExpired(product.expiration_date) ? 'Product Expired' : 
                         (product.status !== 'active' && !product.is_active) ? 'Currently Unavailable' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No products message */}
            {products.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(pagination.totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`btn-sm px-3 ${
                        currentPage === page
                          ? 'btn-primary'
                          : 'btn-secondary'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Floating Orders Button */}
      {orderStats.total > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <a
            href="/dev/orders"
            className="btn-primary btn-lg inline-flex items-center rounded-full group"
            title="View My Orders"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-sm font-medium">
              Orders ({orderStats.total})
            </span>
            {hasPendingOrders() && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"></div>
            )}
          </a>
        </div>
      )}

      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 ${
            notification.type === 'success' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
          }`}>
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notification.type === 'success' ? (
                    <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setNotification({ show: false, type: '', message: '' })}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Modal */}
      <OrderModal
        isOpen={showOrderModal}
        onClose={handleCloseOrderModal}
        product={orderProduct}
        onOrderCreated={handleOrderCreated}
      />

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={showConfirmationModal}
        onClose={handleCloseConfirmationModal}
        order={createdOrder}
      />

      {/* Product Details Modal */}
      <ProductDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
        product={selectedProduct}
        onOrderClick={handleOrderClick}
      />
    </>
  );
};

export default DevProducts;