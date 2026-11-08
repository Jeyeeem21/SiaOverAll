import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Loader2, Printer, PhilippinePeso, ReceiptText, CheckCircle2, PlayCircle, Eye, Download, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { printOrdersAPI } from '../services/api';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';
import { useState } from 'react';
import Pagination from '../components/Pagination';

const PRINT_API_URL = import.meta.env.VITE_PRINT_API_URL.replace(/\/$/, '');
const PRINT_API_ORIGIN = new URL(PRINT_API_URL).origin;

const peso = (value) => `₱${Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusStyle = (status) => ({
  submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  reviewing: 'bg-amber-50 text-amber-700 border-amber-200',
  awaiting_payment: 'bg-orange-50 text-orange-700 border-orange-200',
  payment_confirmed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  printing: 'bg-violet-50 text-violet-700 border-violet-200',
  ready_for_pickup: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
}[status] || 'bg-gray-100 text-gray-600 border-gray-200');

const readable = (value) => (value || '—').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function PrintOrders() {
  usePageTitle('Print Orders');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Create order form state
  const [createForm, setCreateForm] = useState({
    student_name: '',
    student_id: '',
    student_email: '',
    student_phone: '',
    color_type: 'black_white',
    paper_size: 'A4',
    print_side: 'single',
    copies: 1,
    total_pages: 1,
    binding_type: 'none',
    special_instructions: '',
    amount_paid: '',
    payment_method: 'cash_on_pickup',
  });

  // Student search state
  const [studentSearch, setStudentSearch] = useState('');
  const [studentResults, setStudentResults] = useState([]);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [searchingStudents, setSearchingStudents] = useState(false);
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['printOrders', isAdmin ? 'printed' : 'queue'],
    queryFn: async () => (isAdmin
      ? (await printOrdersAPI.getPrintedReport()).data
      : (await printOrdersAPI.getStaffQueue()).data),
    refetchInterval: 5000,
  });

  // Mutation for updating order status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, paymentAmount, paymentReference }) => {
      return await printOrdersAPI.updateOrderStatus(orderId, status, paymentAmount, paymentReference);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['printOrders']);
      toast.success('Order status updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update order status');
    },
  });

  // Mutation for creating new order
  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      return await printOrdersAPI.createOrder(orderData);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries(['printOrders']);
      toast.success(`Order ${response.data.data.order_number} created successfully!`);
      setShowCreateModal(false);
      // Reset form
      setCreateForm({
        student_name: '',
        student_id: '',
        student_email: '',
        student_phone: '',
        color_type: 'black_white',
        paper_size: 'A4',
        print_side: 'single',
        copies: 1,
        total_pages: 1,
        binding_type: 'none',
        special_instructions: '',
        amount_paid: '',
        payment_method: 'cash_on_pickup',
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create order');
    },
  });

  // Mutation for deleting files (admin only)
  const deleteFilesMutation = useMutation({
    mutationFn: async (orderId) => {
      return await printOrdersAPI.deleteFiles(orderId);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries(['printOrders']);
      toast.success(response.data.message || 'Files deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete files');
    },
  });

  const handleDeleteFiles = (order) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  const confirmDeleteFiles = () => {
    if (orderToDelete) {
      deleteFilesMutation.mutate(orderToDelete.print_order_id);
      setShowDeleteModal(false);
      setOrderToDelete(null);
    }
  };

  const handleCreateOrder = () => {
    if (!createForm.student_name.trim()) {
      toast.error('Student name is required');
      return;
    }
    createOrderMutation.mutate(createForm);
  };

  // Search students as user types
  const handleStudentSearch = async (value) => {
    setStudentSearch(value);
    setCreateForm({...createForm, student_name: value});
    
    if (value.length < 2) {
      setStudentResults([]);
      setShowStudentDropdown(false);
      return;
    }

    setSearchingStudents(true);
    try {
      const response = await printOrdersAPI.searchStudents(value);
      setStudentResults(response.data.data || []);
      setShowStudentDropdown(true);
    } catch (error) {
      console.error('Error searching students:', error);
    } finally {
      setSearchingStudents(false);
    }
  };

  // Select student from dropdown - auto-fill all fields
  const handleSelectStudent = (student) => {
    setCreateForm({
      ...createForm,
      student_name: student.name,
      student_id: student.student_id || '',
      student_email: student.email || '',
      student_phone: student.phone || '',
    });
    setStudentSearch(student.name);
    setShowStudentDropdown(false);
    setStudentResults([]);
  };

  const handleStartPrinting = async (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
    setLoadingDetails(true);
    
    try {
      // Fetch full order details with files from Student Print module
      const response = await fetch(`${PRINT_API_URL}/print-orders/${order.print_order_id}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedOrderDetails(data.data);
      } else {
        toast.error('Failed to load order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const confirmStartPrinting = () => {
    updateStatusMutation.mutate({ orderId: selectedOrder.print_order_id, status: 'printing' });
    setShowDetailsModal(false);
  };

  const handleMarkComplete = (order) => {
    setSelectedOrder(order);
    setPaymentAmount(''); // Empty by default - staff enters the actual amount
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }
    
    const paymentData = {
      orderId: selectedOrder.print_order_id, 
      status: 'completed',
      paymentAmount: parseFloat(paymentAmount),
      paymentReference: paymentReference || null
    };
    
    console.log('🚀 [FIX v2] Submitting payment with data:', paymentData);
    console.log('📊 Payment Amount:', paymentData.paymentAmount);
    console.log('📝 Reference:', paymentData.paymentReference);
    
    updateStatusMutation.mutate(
      paymentData,
      {
        onSuccess: (response) => {
          console.log('✅ Payment submitted successfully');
          console.log('📦 Response:', response);
          toast.success(`Payment of ₱${paymentAmount} recorded!`);
          setShowPaymentModal(false);
          setPaymentAmount('');
          setPaymentReference('');
        },
        onError: (error) => {
          console.error('❌ Payment submission failed:', error);
          console.error('Error details:', error.response?.data);
        }
      }
    );
  };

  const handleViewDetails = async (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
    setLoadingDetails(true);
    
    try {
      // Fetch full order details with files from Student Print module
      const response = await fetch(`${PRINT_API_URL}/print-orders/${order.print_order_id}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedOrderDetails(data.data);
      } else {
        toast.error('Failed to load order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const orders = data?.orders || [];
  const totalPages = Math.max(1, Math.ceil(orders.length / itemsPerPage));
  const paginatedOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const summary = data?.summary || {};
  const title = isAdmin ? 'Printed Orders' : 'New Print Orders';
  const description = isAdmin
    ? 'All completed print jobs and the revenue collected from them.'
    : 'Live queue of student print orders that still need staff handling.';

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            Create Order
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <SummaryCard icon={Printer} label={isAdmin ? 'Completed Orders' : 'Total Orders'} value={isAdmin ? summary.printed_orders : summary.active_orders} />
        <SummaryCard icon={ReceiptText} label={isAdmin ? 'Total Revenue' : 'New Submissions'} value={isAdmin ? peso(summary.amount_paid) : summary.new_orders} />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? <div className="flex items-center justify-center gap-2 p-12 text-sm text-gray-500"><Loader2 className="h-5 w-5 animate-spin" /> Loading print orders…</div> : isError ? <div className="p-12 text-center text-sm text-red-600">Could not load print orders. Please refresh and sign in again.</div> : (
          <><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Print details</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {orders.length === 0 ? <tr><td colSpan="7" className="px-5 py-12 text-center text-gray-500">No {isAdmin ? 'completed' : 'active'} print orders yet.</td></tr> : paginatedOrders.map((order) => <tr key={order.print_order_id} className="hover:bg-gray-50">
                <td className="px-5 py-4 font-semibold text-gray-900">{order.order_number}</td>
                <td className="px-5 py-4"><div className="font-medium text-gray-900">{order.student_name}</div><div className="text-xs text-gray-500">{order.student_id || order.student_email}</div></td>
                <td className="px-5 py-4 text-gray-600">{readable(order.color_type)} · {order.paper_size} · {order.total_pages || order.copies} pages</td>
                <td className="px-5 py-4 text-right">
                  {order.amount_paid && order.amount_paid > 0 ? (
                    <>
                      <div className="font-semibold text-gray-900">{peso(order.amount_paid)}</div>
                      <div className="text-xs font-normal text-gray-500">Paid</div>
                    </>
                  ) : (
                    <div className="text-gray-400">—</div>
                  )}
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle(order.status)}`}>
                    {readable(order.status)}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="text-xs text-gray-500">
                    <div className="font-medium">{new Date(order.created_at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                    {order.preferred_pickup_date && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="font-semibold text-gray-700 mb-1">Preferred Pickup:</div>
                        <div className="text-emerald-600">{new Date(order.preferred_pickup_date).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                      </div>
                    )}
                    {order.special_instructions && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="font-semibold text-gray-700 mb-1">Special Instructions:</div>
                        <div className="text-gray-600 italic max-w-xs">{order.special_instructions}</div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {/* View Button - Icon Only */}
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                      title="View order details and files"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    {isAdmin && (
                      /* Delete Files Button - Icon Only - Only show if files NOT deleted */
                      !order.files_deleted_at ? (
                        <button
                          onClick={() => handleDeleteFiles(order)}
                          disabled={deleteFilesMutation.isPending}
                          className="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Delete uploaded files to free storage"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Files deleted</span>
                      )
                    )}
                    
                    {!isAdmin && (
                      <>
                        {(order.status === 'submitted' || order.status === 'payment_confirmed') && (
                          <button
                            onClick={() => handleStartPrinting(order)}
                            disabled={updateStatusMutation.isPending}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Start printing this order"
                          >
                            <PlayCircle className="h-3.5 w-3.5" />
                            Print
                          </button>
                        )}
                        {order.status === 'printing' && (
                          <button
                            onClick={() => handleMarkComplete(order)}
                            disabled={updateStatusMutation.isPending}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Mark as completed and record payment"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Complete
                          </button>
                        )}
                        {(order.status === 'completed' || order.status === 'ready_for_pickup') && (
                          <span className="text-xs text-emerald-600 font-medium">✓ Done</span>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>)}</tbody>
          </table></div>
          {orders.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-3">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={orders.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(value) => {
                  setItemsPerPage(value);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
          </>
        )}
      </div>
      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <p className="text-sm text-gray-500">{selectedOrder.order_number}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Student Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Student Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <p className="font-medium text-gray-900">{selectedOrder.student_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">ID:</span>
                    <p className="font-medium text-gray-900">{selectedOrder.student_id || '—'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium text-gray-900">{selectedOrder.student_email}</p>
                  </div>
                </div>
              </div>

              {/* Print Details */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Print Specifications</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Color Type:</span>
                    <p className="font-medium text-gray-900">{readable(selectedOrder.color_type)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Paper Size:</span>
                    <p className="font-medium text-gray-900">{selectedOrder.paper_size}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Print Side:</span>
                    <p className="font-medium text-gray-900">{readable(selectedOrder.print_side)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Copies:</span>
                    <p className="font-medium text-gray-900">{selectedOrder.copies}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Binding:</span>
                    <p className="font-medium text-gray-900">{readable(selectedOrder.binding_type)}</p>
                  </div>
                </div>
              </div>

              {/* Files Section */}
              <div className="bg-emerald-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Files to Print
                </h3>
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                    <span className="ml-2 text-sm text-gray-600">Loading files...</span>
                  </div>
                ) : selectedOrderDetails?.files && selectedOrderDetails.files.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOrderDetails.files.map((file) => {
                      const fileUrl = `${PRINT_API_ORIGIN}${file.download_url}`;
                      const isPDF = file.file_type?.toLowerCase().includes('pdf');
                      
                      return (
                        <div key={file.file_id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-emerald-200">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="p-2 bg-emerald-100 rounded">
                              <FileText className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{file.original_filename}</p>
                              <p className="text-xs text-gray-500">
                                {file.file_size} • {file.page_count} pages • {file.file_type}
                              </p>
                              {isPDF ? (
                                <p className="text-xs text-emerald-600 mt-1">
                                  ✓ PDF - Can print directly in browser
                                </p>
                              ) : (
                                <p className="text-xs text-amber-600 mt-1">
                                  📥 Word/Doc - Download to print with best formatting
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Download Button */}
                            <a
                              href={fileUrl}
                              download
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                              title="Download file to computer"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </a>
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="mt-4 pt-4 border-t border-emerald-200">
                      <button
                        onClick={() => {
                          selectedOrderDetails.files.forEach(file => {
                            window.open(`${PRINT_API_ORIGIN}${file.download_url}`, '_blank');
                          });
                          toast.success(`Opening ${selectedOrderDetails.files.length} files for download...`);
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Download All ({selectedOrderDetails.files.length})
                      </button>
                    </div>
                    
                    <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-semibold text-gray-800 mb-2">
                        📌 Printing Instructions:
                      </p>
                      <div className="space-y-2 text-xs text-gray-700">
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">1.</span>
                          <div>
                            <strong>Download the file(s)</strong> - Click "Download" button for each file or use "Download All"
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">2.</span>
                          <div>
                            <strong>Open the downloaded file</strong> - PDFs will open in your PDF reader, Word docs in Microsoft Word
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">3.</span>
                          <div>
                            <strong>Print from the application</strong> - Use File → Print (Ctrl+P) to send to your printer
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">💡</span>
                          <div>
                            <strong>Tip:</strong> For best results, check print settings (paper size, orientation, color) before printing!
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    <p>No files uploaded for this order</p>
                  </div>
                )}
              </div>

              {/* Additional Details */}
              {(selectedOrder.preferred_pickup_date || selectedOrder.special_instructions) && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Additional Details</h3>
                  {selectedOrder.preferred_pickup_date && (
                    <div className="mb-3">
                      <span className="text-gray-500 text-sm">Preferred Pickup:</span>
                      <p className="font-medium text-emerald-600">{new Date(selectedOrder.preferred_pickup_date).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                  )}
                  {selectedOrder.special_instructions && (
                    <div>
                      <span className="text-gray-500 text-sm">Special Instructions:</span>
                      <p className="font-medium text-gray-900 italic mt-1">{selectedOrder.special_instructions}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              
              {/* Show "Start Printing" button if order is submitted or payment_confirmed */}
              {!isAdmin && (selectedOrder.status === 'submitted' || selectedOrder.status === 'payment_confirmed') && (
                <button
                  onClick={confirmStartPrinting}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium inline-flex items-center justify-center gap-2"
                >
                  {updateStatusMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4" />
                      Start Printing
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="text-white">
                <h2 className="text-xl font-bold">Complete Order</h2>
                <p className="text-sm text-emerald-100">{selectedOrder.order_number}</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-white hover:text-emerald-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Student:</span>
                  <span className="font-medium text-gray-900">{selectedOrder.student_name}</span>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Order:</span>
                  <span className="font-medium text-gray-900">{selectedOrder.order_number}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {selectedOrder.payment_method?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-sm text-blue-800">
                  💡 <strong>Note:</strong> Enter the actual amount you're charging the student. This may differ from any initial estimate.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Charge <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₱</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount (e.g., 50.00)"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    autoFocus
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enter the final amount based on actual pages printed and services provided
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Reference (Optional)
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Receipt number, transaction ID, etc."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
                disabled={!paymentAmount || updateStatusMutation.isPending}
                className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {updateStatusMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Complete Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="text-white">
                <h2 className="text-xl font-bold">Create Manual Order</h2>
                <p className="text-sm text-blue-100">For walk-in or phone orders (file upload optional)</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white hover:text-blue-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Student Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Student Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => handleStudentSearch(e.target.value)}
                      onFocus={() => studentResults.length > 0 && setShowStudentDropdown(true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search by name, email, or ID..."
                      autoComplete="off"
                    />
                    {searchingStudents && (
                      <div className="absolute right-3 top-9">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      </div>
                    )}
                    {showStudentDropdown && studentResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {studentResults.map((student) => (
                          <button
                            key={student.id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectStudent(student);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{student.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                              {student.student_id && <span>ID: {student.student_id}</span>}
                              {student.email && <span>• {student.email}</span>}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Start typing to search, or enter manually
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                    <input
                      type="text"
                      value={createForm.student_id}
                      onChange={(e) => setCreateForm({...createForm, student_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="2023-00001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={createForm.student_phone}
                      onChange={(e) => setCreateForm({...createForm, student_phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="09123456789"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={createForm.student_email}
                      onChange={(e) => setCreateForm({...createForm, student_email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="student@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Print Specifications */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Print Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color Type <span className="text-red-500">*</span></label>
                    <select
                      value={createForm.color_type}
                      onChange={(e) => setCreateForm({...createForm, color_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="black_white">Black & White</option>
                      <option value="colored">Colored</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paper Size <span className="text-red-500">*</span></label>
                    <select
                      value={createForm.paper_size}
                      onChange={(e) => setCreateForm({...createForm, paper_size: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="A4">A4</option>
                      <option value="A3">A3</option>
                      <option value="Letter">Letter</option>
                      <option value="Legal">Legal</option>
                      <option value="Short">Short</option>
                      <option value="Long">Long</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Print Side <span className="text-red-500">*</span></label>
                    <select
                      value={createForm.print_side}
                      onChange={(e) => setCreateForm({...createForm, print_side: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="single">Single-sided</option>
                      <option value="double">Double-sided</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Binding <span className="text-red-500">*</span></label>
                    <select
                      value={createForm.binding_type}
                      onChange={(e) => setCreateForm({...createForm, binding_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="none">None</option>
                      <option value="staple">Staple</option>
                      <option value="spiral">Spiral</option>
                      <option value="plastic_comb">Plastic Comb</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Pages <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min="1"
                      value={createForm.total_pages}
                      onChange={(e) => setCreateForm({...createForm, total_pages: parseInt(e.target.value) || 1})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Total number of pages"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Copies <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min="1"
                      value={createForm.copies}
                      onChange={(e) => setCreateForm({...createForm, copies: parseInt(e.target.value) || 1})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Number of copies"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Payment Information (Optional)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method <span className="text-red-500">*</span></label>
                    <select
                      value={createForm.payment_method}
                      onChange={(e) => setCreateForm({...createForm, payment_method: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="cash_on_pickup">Cash on Pickup</option>
                      <option value="gcash">GCash</option>
                      <option value="paymaya">PayMaya</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={createForm.amount_paid}
                        onChange={(e) => setCreateForm({...createForm, amount_paid: e.target.value})}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Leave empty if payment not yet received</p>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                <textarea
                  value={createForm.special_instructions}
                  onChange={(e) => setCreateForm({...createForm, special_instructions: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any special requirements or notes..."
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> File upload is optional for manual orders. This is useful for recording walk-in or phone orders where documents are provided physically.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={createOrderMutation.isPending}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrder}
                disabled={createOrderMutation.isPending || !createForm.student_name.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium inline-flex items-center gap-2"
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Files Confirmation Modal */}
      {showDeleteModal && orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-8 py-6 bg-gradient-to-r from-red-600 to-red-700">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center ring-4 ring-white/30">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Delete Files</h2>
                  <p className="text-red-100 text-sm mt-1">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-8">
              <div className="mb-6">
                <p className="text-gray-800 font-medium mb-2">
                  Are you sure you want to delete all files for order <span className="font-bold text-red-600">{orderToDelete.order_number}</span>?
                </p>
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>⚠️ Warning:</strong> This will permanently delete the uploaded documents (PDF, Word, etc.) to free up storage space.
                  </p>
                  <p className="text-sm text-gray-700 mt-2">
                    The order data will be kept for records.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setOrderToDelete(null);
                }}
                className="flex-1 px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFiles}
                disabled={deleteFilesMutation.isPending}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 inline-flex items-center justify-center gap-2"
              >
                {deleteFilesMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Files
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-lg bg-emerald-50 p-2.5"><Icon className="h-5 w-5 text-emerald-600" /></div><div><p className="text-xs font-medium text-gray-500">{label}</p><p className="mt-1 text-2xl font-bold text-gray-900">{value ?? 0}</p></div></div></div>;
}
