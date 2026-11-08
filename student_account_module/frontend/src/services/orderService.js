import ApiService from './api';

class OrderService {
  /**
   * Create a new order for a product
   * @param {Object} orderData - Order details
   * @param {number} orderData.product_id - Product ID
   * @param {number} orderData.quantity - Quantity to order
   * @param {string} [orderData.notes] - Optional notes
   * @param {string} [orderData.priority] - Order priority (normal, high, urgent)
   * @param {string} [orderData.pickup_method] - Pickup method (pickup, delivery)
   */
  async createProductOrder(orderData) {
    try {
      const response = await ApiService.createOrder(orderData);
      return response;
    } catch (error) {
      console.error('Create order error:', error);
      throw new Error(error.message || 'Failed to create order');
    }
  }

  /**
   * Get all orders for the current user
   */
  async getMyOrders() {
    try {
      const orders = await ApiService.getUserOrders();
      return Array.isArray(orders) ? orders : [];
    } catch (error) {
      console.error('Get orders error:', error);
      throw new Error(error.message || 'Failed to fetch orders');
    }
  }

  /**
   * Get a specific order by ID
   * @param {number} orderId - Order ID
   */
  async getOrder(orderId) {
    try {
      const order = await ApiService.getOrderById(orderId);
      return order;
    } catch (error) {
      console.error('Get order error:', error);
      throw new Error(error.message || 'Failed to fetch order details');
    }
  }

  /**
   * Update order details (payment method, notes)
   * @param {number} orderId - Order ID
   * @param {Object} updateData - Data to update
   * @param {string} [updateData.payment_method] - Payment method
   * @param {string} [updateData.notes] - Updated notes
   */
  async updateOrder(orderId, updateData) {
    try {
      const response = await ApiService.updateOrder(orderId, updateData);
      return response;
    } catch (error) {
      console.error('Update order error:', error);
      throw new Error(error.message || 'Failed to update order');
    }
  }

  /**
   * Cancel an order
   * @param {number} orderId - Order ID
   * @param {string} reason - Cancellation reason
   */
  async cancelOrder(orderId, reason) {
    try {
      if (!reason || reason.trim().length === 0) {
        throw new Error('Cancellation reason is required');
      }
      
      const response = await ApiService.cancelOrder(orderId, reason);
      return response;
    } catch (error) {
      console.error('Cancel order error:', error);
      throw new Error(error.message || 'Failed to cancel order');
    }
  }

  /**
   * Get order statistics for dashboard
   */
  async getOrderStats() {
    try {
      const orders = await this.getMyOrders();
      
      const stats = {
        total: orders.length,
        pending: 0,
        processing: 0,
        completed: 0,
        cancelled: 0,
        totalSpent: 0,
        pendingPayments: 0
      };

      orders.forEach(order => {
        // Count by status
        stats[order.status] = (stats[order.status] || 0) + 1;
        
        // Calculate amounts
        if (order.payment_status === 'paid') {
          stats.totalSpent += parseFloat(order.total_amount || 0);
        } else if (order.payment_status === 'unpaid' && order.status !== 'cancelled') {
          stats.pendingPayments += parseFloat(order.total_amount || 0);
        }
      });

      return stats;
    } catch (error) {
      console.error('Get order stats error:', error);
      return {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        cancelled: 0,
        totalSpent: 0,
        pendingPayments: 0
      };
    }
  }

  /**
   * Format order data for display
   * @param {Object} order - Raw order data
   */
  formatOrder(order) {
    return {
      id: order.id,
      orderNumber: order.order_number,
      item: order.item,
      documentType: order.document_type,
      quantity: order.quantity,
      unitPrice: parseFloat(order.unit_price || 0),
      amount: parseFloat(order.total_amount || 0),
      status: order.status,
      priority: order.priority,
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method,
      pickupMethod: order.pickup_method,
      pickupDate: order.pickup_date,
      expectedCompletion: order.expected_completion,
      completedAt: order.completed_at,
      cancelledReason: order.cancelled_reason,
      notes: order.notes,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    };
  }

  /**
   * Get status display information
   * @param {string} status - Order status
   */
  getStatusInfo(status) {
    const statusMap = {
      pending: {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800',
        description: 'Order received and awaiting processing'
      },
      processing: {
        label: 'Processing',
        color: 'bg-blue-100 text-blue-800',
        description: 'Order is being prepared'
      },
      completed: {
        label: 'Completed',
        color: 'bg-green-100 text-green-800',
        description: 'Order completed successfully'
      },
      cancelled: {
        label: 'Cancelled',
        color: 'bg-red-100 text-red-800',
        description: 'Order has been cancelled'
      }
    };

    return statusMap[status] || {
      label: status,
      color: 'bg-gray-100 text-gray-800',
      description: 'Unknown status'
    };
  }

  /**
   * Get payment status display information
   * @param {string} paymentStatus - Payment status
   */
  getPaymentStatusInfo(paymentStatus) {
    const paymentMap = {
      unpaid: {
        label: 'Unpaid',
        color: 'bg-red-100 text-red-800',
        description: 'Payment pending'
      },
      paid: {
        label: 'Paid',
        color: 'bg-green-100 text-green-800',
        description: 'Payment completed'
      },
      partially_paid: {
        label: 'Partially Paid',
        color: 'bg-yellow-100 text-yellow-800',
        description: 'Partial payment received'
      },
      refunded: {
        label: 'Refunded',
        color: 'bg-blue-100 text-blue-800',
        description: 'Payment refunded'
      },
      failed: {
        label: 'Payment Failed',
        color: 'bg-red-100 text-red-800',
        description: 'Payment processing failed'
      }
    };

    return paymentMap[paymentStatus] || {
      label: paymentStatus,
      color: 'bg-gray-100 text-gray-800',
      description: 'Unknown payment status'
    };
  }

  /**
   * Validate order data before submission
   * @param {Object} orderData - Order data to validate
   */
  validateOrderData(orderData) {
    const errors = [];

    if (!orderData.product_id) {
      errors.push('Product is required');
    }

    if (!orderData.quantity || orderData.quantity < 1) {
      errors.push('Quantity must be at least 1');
    }

    if (orderData.quantity > 100) {
      errors.push('Quantity cannot exceed 100');
    }

    if (orderData.notes && orderData.notes.length > 1000) {
      errors.push('Notes cannot exceed 1000 characters');
    }

    if (orderData.priority && !['normal', 'high', 'urgent'].includes(orderData.priority)) {
      errors.push('Invalid priority level');
    }

    if (orderData.pickup_method && !['pickup', 'delivery'].includes(orderData.pickup_method)) {
      errors.push('Invalid pickup method');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate order totals
   * @param {number} unitPrice - Unit price
   * @param {number} quantity - Quantity
   * @param {number} [taxRate=0] - Tax rate (optional)
   */
  calculateOrderTotals(unitPrice, quantity, taxRate = 0) {
    const subtotal = unitPrice * quantity;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return {
      subtotal,
      tax,
      total,
      unitPrice,
      quantity
    };
  }
}

export default new OrderService();