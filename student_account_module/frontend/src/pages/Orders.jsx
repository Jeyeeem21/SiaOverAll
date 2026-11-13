import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { useStudentOrders } from '../hooks/useStudentData';
import OrderDetailsModal from '../components/modals/OrderDetailsModal';
import PrintService from '../services/printService';
import { useAuth } from '../context/AuthContext';
import { CardGridSkeleton, LoadingBar } from '../components/LoadingStates';

const Orders = () => {
  const { user } = useAuth();
  const { orders, loading, error, refetch } = useStudentOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [printOrders, setPrintOrders] = useState([]);
  const [printOrdersLoading, setPrintOrdersLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [printOrdersPage, setPrintOrdersPage] = useState(1);
  const [productOrdersPage, setProductOrdersPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(4);
  
  // Stable email reference to avoid useEffect dependency issues
  const userEmail = user?.student_email || user?.email || null;

  // Separate product orders from document orders
  const productOrders = orders.filter(order => order.items && Array.isArray(order.items));
  const documentOrders = orders.filter(order => !order.items || !Array.isArray(order.items));
  const printOrdersTotalPages = Math.max(1, Math.ceil(printOrders.length / ordersPerPage));
  const productOrdersTotalPages = Math.max(1, Math.ceil(productOrders.length / ordersPerPage));
  const paginatedPrintOrders = printOrders.slice((printOrdersPage - 1) * ordersPerPage, printOrdersPage * ordersPerPage);
  const paginatedProductOrders = productOrders.slice((productOrdersPage - 1) * ordersPerPage, productOrdersPage * ordersPerPage);

  // Fetch print orders
  useEffect(() => {
    const fetchPrintOrders = async () => {
      if (!userEmail) {
        console.log('No email available for fetching print orders');
        setPrintOrdersLoading(false);
        setIsInitialLoad(false);
        return;
      }

      try {
        // Only show loading skeleton on initial load, not on refresh
        if (isInitialLoad) {
          setPrintOrdersLoading(true);
        }
        
        console.log('Fetching print orders for:', userEmail);
        const printApiUrl = import.meta.env.VITE_PRINT_API_URL;
        const response = await fetch(`${printApiUrl}/print-orders?student_email=${encodeURIComponent(userEmail)}`);
        const data = await response.json();
        
        console.log('Print orders response:', data);
        
        if (data.success && data.data) {
          const orders = data.data.data || [];
          console.log('Print orders found:', orders.length);
          setPrintOrders(orders);
        } else {
          console.log('No print orders data in response');
          setPrintOrders([]);
        }
      } catch (err) {
        console.error('Failed to fetch print orders:', err);
        setPrintOrders([]);
      } finally {
        if (isInitialLoad) {
          setPrintOrdersLoading(false);
          setIsInitialLoad(false);
        }
      }
    };

    fetchPrintOrders();
    // Refresh every 10 seconds - but silently (no loading state)
    const interval = setInterval(fetchPrintOrders, 10000);
    return () => clearInterval(interval);
  }, [userEmail, isInitialLoad]); // Now using stable string value

  return (
    <>
      <LoadingBar isLoading={loading || printOrdersLoading} />
      <Navigation userRole="student" />
      <div className="min-h-screen bg-gray-50">
        
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-5 lg:px-6">
            <div className="py-5">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">My Orders</h1>
              <p className="mt-1.5 text-[11px] text-gray-400">
                Track your document requests and orders
              </p>
            </div>
          </div>
        </header>

        <main className="mt-7 max-w-7xl mx-auto px-5 lg:px-6 pb-20">
          {false && (
          <>{/* Removed document-request cards: orders are created through Print Services. */}
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
          </div></>)}

          {/* Print Service Orders - Card Grid */}
          <div className="card mb-6">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-[15px] font-bold text-gray-900">Print Service Orders</h2>
              <p className="text-[11px] text-gray-400 mt-1">Your printing, binding, and lamination orders</p>
            </div>
            <div className="p-5">
              {printOrdersLoading ? (
                <CardGridSkeleton count={4} />
              ) : printOrders && printOrders.length > 0 ? (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paginatedPrintOrders.map((order) => (
                    <button
                      key={order.print_order_id}
                      type="button"
                      onClick={() => setSelectedOrder({ ...order, type: 'print' })}
                      className="text-left p-4 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:shadow-md transition-all"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{order.order_number}</p>
                            <p className="text-xs text-gray-500">{order.files_count || 0} file(s)</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                          order.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                          order.status === 'printing' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                          order.status === 'payment_confirmed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                          order.status === 'submitted' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                          order.status === 'cancelled' ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                          'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}>
                          {order.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>

                      {/* Specs */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span className="capitalize">{order.color_type?.replace(/_/g, ' ')}</span>
                          <span>•</span>
                          <span>{order.paper_size}</span>
                          <span>•</span>
                          <span>{order.total_pages || order.copies} pages</span>
                        </div>
                        
                        {order.amount_paid && order.amount_paid > 0 ? (
                          <div className="flex items-center gap-2 text-sm">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-bold text-purple-700">₱{parseFloat(order.amount_paid).toFixed(2)}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-400 italic">Amount pending</span>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="pt-3 border-t border-gray-100 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Created {new Date(order.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', timeZone: 'Asia/Manila' })}</span>
                        </div>
                        {order.preferred_pickup_date && (
                          <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Pickup: {new Date(order.preferred_pickup_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', timeZone: 'Asia/Manila' })} at {new Date(order.preferred_pickup_date).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Manila' })}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 text-sm text-gray-600">
                  <span>Showing {(printOrdersPage - 1) * ordersPerPage + 1}-{Math.min(printOrdersPage * ordersPerPage, printOrders.length)} of {printOrders.length}</span>
                  <div className="flex items-center gap-2">
                    <select className="rounded border border-gray-300 px-2 py-1" value={ordersPerPage} onChange={(e) => { setOrdersPerPage(Number(e.target.value)); setPrintOrdersPage(1); setProductOrdersPage(1); }}><option value={4}>4</option><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select>
                    <button className="rounded border px-3 py-1 disabled:opacity-40" disabled={printOrdersPage === 1} onClick={() => setPrintOrdersPage((page) => page - 1)}>Previous</button>
                    <span>Page {printOrdersPage} of {printOrdersTotalPages}</span>
                    <button className="rounded border px-3 py-1 disabled:opacity-40" disabled={printOrdersPage === printOrdersTotalPages} onClick={() => setPrintOrdersPage((page) => page + 1)}>Next</button>
                  </div>
                </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-900 mb-1">No print orders yet</p>
                  <p className="text-xs text-gray-400">Submit your first print order to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Business Center Product Orders - 2 Column Grid */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100 bg-emerald-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-gray-900">Business Center Orders</h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">Products from school business center</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              {loading ? (
                <CardGridSkeleton count={4} />
              ) : productOrders && productOrders.length > 0 ? (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paginatedProductOrders.map((order, index) => (
                    <button
                      key={order.id || index}
                      type="button"
                      onClick={() => setSelectedOrder({ ...order, type: 'product' })}
                      className="text-left p-5 border border-gray-100 rounded-2xl hover:border-emerald-300 hover:shadow-md transition-all bg-white"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-base mb-1">
                            {order.items?.length > 1 
                              ? `${order.items.length} Items` 
                              : order.items?.[0]?.product_name || 'Order'}
                          </p>
                          <p className="text-[11px] text-emerald-600 font-medium">#{order.order_number}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full ml-2 flex-shrink-0 ${
                          order.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                          order.status === 'processing' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                          order.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                          order.status === 'cancelled' ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                          'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}>
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                        </span>
                      </div>

                      {/* Items List */}
                      {order.items && order.items.length > 0 && (
                        <div className="mb-3 space-y-1.5">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm bg-white rounded-lg px-3 py-2 border border-gray-100">
                              <span className="text-gray-700 truncate flex-1">{item.product_name}</span>
                              <span className="text-gray-500 text-xs ml-2">×{item.quantity}</span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <p className="text-[11px] text-emerald-600 font-medium pl-3">+{order.items.length - 3} more items</p>
                          )}
                        </div>
                      )}
                      
                      {/* Price and Payment */}
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {order.amount_paid && order.amount_paid > 0 ? (
                            <span className="font-bold text-emerald-700 text-lg">₱{parseFloat(order.amount_paid).toFixed(2)}</span>
                          ) : (
                            <span className="text-gray-400 italic">Amount pending</span>
                          )}
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                          order.payment_status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {order.payment_status === 'paid' ? 'Paid' : order.payment_status === 'pending' ? 'Payment Pending' : 'Unpaid'}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Ordered {new Date(order.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila' })}</span>
                        </div>
                        {order.payment_method && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span className="capitalize">{order.payment_method.replace('_', ' ')}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 text-sm text-gray-600">
                  <span>Showing {(productOrdersPage - 1) * ordersPerPage + 1}-{Math.min(productOrdersPage * ordersPerPage, productOrders.length)} of {productOrders.length}</span>
                  <div className="flex items-center gap-2">
                    <button className="rounded border px-3 py-1 disabled:opacity-40" disabled={productOrdersPage === 1} onClick={() => setProductOrdersPage((page) => page - 1)}>Previous</button>
                    <span>Page {productOrdersPage} of {productOrdersTotalPages}</span>
                    <button className="rounded border px-3 py-1 disabled:opacity-40" disabled={productOrdersPage === productOrdersTotalPages} onClick={() => setProductOrdersPage((page) => page + 1)}>Next</button>
                  </div>
                </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-900 mb-1">No product orders yet</p>
                  <p className="text-xs text-gray-400">Visit the products page to place your first order</p>
                </div>
              )}
            </div>
          </div>

          {/* Other Orders - 2 Column Grid */}
          {documentOrders && documentOrders.length > 0 && (
            <div className="bg-white shadow rounded-lg mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Other Orders</h2>
                <p className="text-sm text-gray-500 mt-1">Document requests and other services</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documentOrders.map((order, index) => (
                    <button
                      key={order.id || index}
                      type="button"
                      onClick={() => setSelectedOrder({ ...order, type: 'other' })}
                      className="text-left p-4 border border-gray-100 rounded-2xl hover:border-emerald-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">{order.item}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Order #{order.order_number}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ml-2 flex-shrink-0 ${
                          order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                          order.status === 'In Progress' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                          order.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                          order.status === 'Cancelled' ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                          'bg-gray-100 text-gray-600 border border-gray-300'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm mb-3">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-bold text-emerald-700">₱{order.amount}</span>
                      </div>

                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Created {new Date(order.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila' })}</span>
                        </div>
                        {order.expected_completion && (
                          <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium mt-1">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Expected: {order.expected_completion}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <OrderDetailsModal
        isOpen={Boolean(selectedOrder)}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOrderUpdated={refetch}
      />
    </>
  );
};

export default Orders;
