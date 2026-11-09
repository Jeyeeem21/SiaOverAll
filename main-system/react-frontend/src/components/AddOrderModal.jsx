import React from 'react';
import Modal from './Modal';
import { Plus, Barcode } from 'lucide-react';

const AddOrderModal = ({
  isOpen,
  onClose,
  orderForm,
  setOrderForm,
  currentItem,
  setCurrentItem,
  products,
  addItemToOrder,
  removeItemFromOrder,
  handleSubmitOrder,
  barcodeInputRef,
  quantityInputRef,
  updateOrderItemQuantity
}) => {
  if (!isOpen) return null;
  const selectedProduct = products.find((product) => product.product_id == currentItem.product_id);
  const isWeightProduct = selectedProduct?.sale_type === 'weight';
  const minimumQuantity = isWeightProduct ? 0.01 : 1;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Order"
      size="lg"
      headerGradient="from-emerald-600 to-emerald-600"
    >
      <div className="p-5 space-y-4 flex-1">
        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">Customer Name (Optional)</label>
            <input
              type="text"
              value={orderForm.customer_name}
              onChange={(e) => setOrderForm({ ...orderForm, customer_name: e.target.value })}
              className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-gray-900 bg-white placeholder:text-gray-400"
              placeholder="Walk-in customer if empty"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">Preferred Pickup Date</label>
            <input
              type="date"
              value={orderForm.preferred_pickup_date}
              onChange={(e) => setOrderForm({ ...orderForm, preferred_pickup_date: e.target.value })}
              className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-gray-900 bg-white"
              style={{ colorScheme: 'light' }}
            />
          </div>
        </div>

        {/* Barcode Scanner Section */}
        <div className="border border-emerald-200 rounded-xl p-3 bg-emerald-50">
          <div className="flex items-center gap-2 mb-2">
            <Barcode className="w-4 h-4 text-emerald-600" />
            <h3 className="text-[13px] font-bold text-gray-900">Barcode Scanner</h3>
          </div>
          <input
            ref={barcodeInputRef}
            type="text"
            placeholder="Scan barcode here or type and press Enter..."
            autoFocus
            className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-gray-900 bg-white font-mono"
          />
          <p className="text-[10px] text-gray-600 mt-1.5">💡 Scanner works even while editing quantities!</p>
        </div>

        {/* Add Products Section */}
        <div className="border border-emerald-200 rounded-xl p-3 bg-emerald-50">
          <h3 className="text-[13px] font-bold text-gray-900 mb-3">Add Products Manually</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">Product <span className="text-red-500">*</span></label>
              <select
                value={currentItem.product_id}
                onChange={(e) => {
                  const val = e.target.value;
                  const product = products.find(p => p.product_id == val);
                  setCurrentItem({ ...currentItem, product_id: val, unit_price: product?.price || 0, quantity: product?.sale_type === 'weight' ? 0.25 : 1 });
                }}
                className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-gray-900 bg-white"
              >
                <option value="">Select Product</option>
                {products.map(product => (
                  <option key={product.product_id} value={product.product_id}>{product.product_name} - ₱{product.price}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">Quantity {isWeightProduct ? '(kg)' : ''} <span className="text-red-500">*</span></label>
              <input 
                ref={quantityInputRef}
                type="number" 
                min={minimumQuantity}
                step={isWeightProduct ? '0.01' : '1'}
                value={currentItem.quantity} 
                onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseFloat(e.target.value) || minimumQuantity })} 
                className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-gray-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">Unit Price</label>
              <input type="number" step="0.01" value={currentItem.unit_price} onChange={(e) => setCurrentItem({ ...currentItem, unit_price: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-gray-900 bg-white" />
            </div>
          </div>

          <button onClick={addItemToOrder} className="px-4 py-2 text-[11px] bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all flex items-center gap-2"><Plus className="w-4 h-4"/> Add Product</button>
        </div>

        {/* Order Items List */}
        {orderForm.order_items.length > 0 && (
          <div className="border border-gray-200 rounded-xl p-3">
            <h3 className="text-[13px] font-bold text-gray-900 mb-2">Order Items</h3>
            <div className="space-y-2">
              {orderForm.order_items.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg gap-3">
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-gray-900">{item.product_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        min={item.sale_type === 'weight' ? '0.01' : '1'}
                        step={item.sale_type === 'weight' ? '0.01' : '1'}
                        value={item.quantity}
                        onChange={(e) => updateOrderItemQuantity(index, parseFloat(e.target.value) || (item.sale_type === 'weight' ? 0.01 : 1))}
                        className="w-16 px-2 py-1 text-[11px] border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-gray-900 bg-white font-semibold text-center"
                      />
                      <span className="text-[11px] text-gray-600">× ₱{item.unit_price.toLocaleString()} = ₱{(item.quantity * item.unit_price).toLocaleString()}</span>
                    </div>
                  </div>
                  <button onClick={() => removeItemFromOrder(index)} className="p-1.5 text-[11px] text-rose-600 hover:bg-rose-50 rounded-lg transition-all">Remove</button>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-bold text-gray-900">Total Amount:</span>
                <span className="text-[22px] font-bold text-emerald-600">₱{orderForm.order_items.reduce((sum, it) => sum + (it.quantity * it.unit_price), 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">Notes</label>
          <textarea value={orderForm.notes} onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })} rows="2" className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-gray-900 bg-white placeholder:text-gray-400" placeholder="Add any special instructions..." />
        </div>

      <div className="bg-gray-50 px-5 py-3 rounded-b-2xl flex justify-end gap-2.5 border-t border-gray-200 flex-shrink-0">
        <button onClick={() => { onClose(); setOrderForm({ customer_name: '', notes: '', preferred_pickup_date: new Date().toISOString().split('T')[0], order_items: [] }); }} className="px-4 py-2 text-[11px] border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all">Cancel</button>
        <button onClick={handleSubmitOrder} disabled={orderForm.order_items.length === 0} className="px-4 py-2 text-[11px] bg-emerald-600 text-white rounded-xl font-semibold shadow-sm hover:bg-emerald-700 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed">Create Order</button>
      </div>

      </div>
    </Modal>
  );
};

export default AddOrderModal;
