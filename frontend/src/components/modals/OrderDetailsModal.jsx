import { useState, useEffect } from 'react';
import { useOrders } from '../../hooks/useOrders';

const OrderDetailsModal = ({ isOpen, onClose, order, onOrderUpdated, initialMode = 'view' }) => {
  const [mode, setMode] = useState(initialMode);
  const [cancelReason, setCancelReason] = useState('');
  const [updateData, setUpdateData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { cancelOrder, updateOrder, getStatusInfo, getPaymentStatusInfo } = useOrders();

  // Sync form with order data when modal opens or order changes
  useEffect(() => {
    if (isOpen && order) {
      setUpdateData({
        quantity:         order.total_quantity ?? order.quantity ?? 1,
        priority:         order.priority        ?? 'normal',
        payment_method:   order.payment_method  ?? '',
        pickup_method:    order.pickup_method   ?? 'pickup',
        pickup_date:      order.pickup_date      ?? '',
        delivery_address: order.delivery_address ?? '',
        notes:            order.notes            ?? '',
      });
      setCancelReason('');
      setError('');
      setSuccessMsg('');
      setMode(initialMode);
    }
  }, [isOpen, order, initialMode]);

  if (!isOpen || !order) return null;

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price ?? 0);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const statusInfo  = getStatusInfo(order.status);
  const paymentInfo = getPaymentStatusInfo(order.payment_status);
  const canUpdate   = order.status === 'pending';
  const canCancel   = ['pending', 'processing'].includes(order.status);

  // Estimated total preview
  const estimatedTotal = (updateData.quantity ?? 1) * (order.unit_price ?? order.total_amount ?? 0);

  /* ── handlers ─────────────────────────────────────────── */
  const handleSaveUpdate = async () => {
    setLoading(true);
    setError('');
    try {
      await updateOrder(order.id, {
        quantity:         updateData.quantity,
        priority:         updateData.priority,
        payment_method:   updateData.payment_method,
        pickup_method:    updateData.pickup_method,
        pickup_date:      updateData.pickup_date   || null,
        delivery_address: updateData.delivery_address,
        notes:            updateData.notes,
      });
      setSuccessMsg('Order updated successfully.');
      if (onOrderUpdated) onOrderUpdated();
      setTimeout(() => { setSuccessMsg(''); setMode('view'); }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) { setError('Please provide a reason.'); return; }
    setLoading(true);
    setError('');
    try {
      await cancelOrder(order.id, cancelReason);
      if (onOrderUpdated) onOrderUpdated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── shared input classes ──────────────────────────────── */
  const inputCls = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';
  const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1';

  /* ── render ────────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">
              {mode === 'edit' ? 'Edit Order' : mode === 'cancel' ? 'Cancel Order' : 'Order Details'}
            </p>
            <h2 className="text-base font-bold text-gray-900 mt-0.5">{order.order_number}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ── ORDER SUMMARY (always visible) ── */}
          <div className="px-6 pt-5 pb-4 bg-gray-50 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{order.item}</p>
                {order.document_type && (
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">{order.document_type.replace(/_/g, ' ')}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">Ordered {formatDate(order.created_at)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-gray-900">{formatPrice(order.total_amount)}</p>
                <p className="text-xs text-gray-500">Qty: {order.total_quantity ?? order.quantity}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${paymentInfo.color}`}>
                  {paymentInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════
              VIEW MODE
          ══════════════════════════════════════ */}
          {mode === 'view' && (
            <div className="px-6 py-5 space-y-5">
              {/* Two-column info grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Priority</p>
                  <p className="mt-0.5 font-medium text-gray-800 capitalize">{order.priority ?? 'Normal'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Pickup Method</p>
                  <p className="mt-0.5 font-medium text-gray-800 capitalize">{order.pickup_method ?? 'Pickup'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Payment Method</p>
                  <p className="mt-0.5 font-medium text-gray-800 capitalize">{order.payment_method || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Pickup Date</p>
                  <p className="mt-0.5 font-medium text-gray-800">
                    {order.pickup_date ? new Date(order.pickup_date).toLocaleDateString('en-PH') : '—'}
                  </p>
                </div>
                {order.expected_completion && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Expected Completion</p>
                    <p className="mt-0.5 font-medium text-gray-800">{formatDate(order.expected_completion)}</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-blue-700 mb-1">Notes</p>
                  <p className="text-sm text-blue-800">{order.notes}</p>
                </div>
              )}

              {/* Cancellation reason */}
              {order.cancelled_reason && (
                <div className="bg-red-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-red-600 mb-1">Cancellation Reason</p>
                  <p className="text-sm text-red-700">{order.cancelled_reason}</p>
                </div>
              )}

              {/* Timeline */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">Timeline</p>
                <ol className="relative border-l border-gray-200 space-y-3 pl-4">
                  <li>
                    <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white" />
                    <p className="text-xs font-semibold text-gray-700">Order placed</p>
                    <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                  </li>
                  {order.completed_at && (
                    <li>
                      <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                      <p className="text-xs font-semibold text-gray-700">Completed</p>
                      <p className="text-xs text-gray-400">{formatDate(order.completed_at)}</p>
                    </li>
                  )}
                  <li>
                    <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-gray-300 border-2 border-white" />
                    <p className="text-xs font-semibold text-gray-700">Last updated</p>
                    <p className="text-xs text-gray-400">{formatDate(order.updated_at)}</p>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
              EDIT MODE
          ══════════════════════════════════════ */}
          {mode === 'edit' && (
            <div className="px-6 py-5 space-y-4">
              {/* Quantity + live total */}
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className={labelCls}>Quantity</label>
                  <input
                    type="number" min="1"
                    value={updateData.quantity}
                    onChange={(e) => setUpdateData(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))}
                    className={inputCls}
                  />
                </div>
                <div className="shrink-0 text-right pb-2">
                  <p className="text-xs text-gray-400">Estimated total</p>
                  <p className="text-base font-bold text-gray-900">{formatPrice(estimatedTotal)}</p>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className={labelCls}>Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'cash',          label: '💵 Cash' },
                    { value: 'gcash',         label: '📱 GCash' },
                    { value: 'bank_transfer', label: '🏦 Bank Transfer' },
                    { value: 'card',          label: '💳 Card' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setUpdateData(p => ({ ...p, payment_method: opt.value }))}
                      className={`py-2 rounded-lg text-sm font-medium border transition ${
                        updateData.payment_method === opt.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={labelCls}>Notes <span className="normal-case font-normal text-gray-400">(optional)</span></label>
                <textarea
                  rows={3}
                  value={updateData.notes}
                  onChange={(e) => setUpdateData(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Any special instructions..."
                  className={inputCls}
                />
              </div>

              {/* Feedback */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {successMsg}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════
              CANCEL MODE
          ══════════════════════════════════════ */}
          {mode === 'cancel' && (
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                <svg className="w-8 h-8 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-red-800">Cancel this order?</p>
                  <p className="text-xs text-red-600 mt-0.5">This action cannot be undone.</p>
                </div>
              </div>

              <div>
                <label className={labelCls}>Reason for cancellation <span className="text-red-500">*</span></label>
                <textarea
                  rows={4}
                  value={cancelReason}
                  onChange={(e) => { setCancelReason(e.target.value); setError(''); }}
                  placeholder="Tell us why you're cancelling..."
                  className={`${inputCls} ${error ? 'border-red-400 focus:ring-red-500' : ''}`}
                />
                {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer actions ── */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white">
          {mode === 'view' && (
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
                Close
              </button>
              {canUpdate && (
                <button
                  onClick={() => { setMode('edit'); setError(''); }}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition"
                >
                  Edit Order
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => { setMode('cancel'); setError(''); }}
                  className="flex-1 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition"
                >
                  Cancel Order
                </button>
              )}
            </div>
          )}

          {mode === 'edit' && (
            <div className="flex gap-2">
              <button
                onClick={() => { setMode('view'); setError(''); }}
                disabled={loading}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
              >
                ← Back
              </button>
              <button
                onClick={handleSaveUpdate}
                disabled={loading}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving...</>
                ) : 'Save Changes'}
              </button>
            </div>
          )}

          {mode === 'cancel' && (
            <div className="flex gap-2">
              <button
                onClick={() => { setMode('view'); setError(''); }}
                disabled={loading}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
              >
                ← Back
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={loading || !cancelReason.trim()}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Cancelling...</>
                ) : 'Confirm Cancel'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
